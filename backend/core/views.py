from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from .models import *
from .serializers import *
import requests
import threading
import os
from google import genai

def sanitize_input(text):
    if not text: return ""
    import re
    # 1. Total rejection for common injection and administrative keywords
    forbidden = [
        'ignore', 'instruction', 'system', 'prompt', 'developer', 'secret', 'rule', 
        'override', 'reset', 'bypass', 'admin', 'manager', 'billing', 'license', 
        'config', 'database', 'key', 'password', 'login', 'token'
    ]
    if any(word in text.lower() for word in forbidden):
        return None # Result in a 400 error
    
    # 2. Relaxed character filtering for better NLP (Allow common sentence symbols)
    clean = re.sub(r'[^a-zA-Z0-9\s?.,!@#%^&*()\-+=:;\"\'/\[\]]', '', text)
    
    return clean.strip()[:500] # Extend length for more complex queries

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_ask_ai(request):
    user = request.user
    if user.role not in ['PARENT', 'STUDENT']:
        return Response({'error': 'Role not authorized for AI Assistant'}, status=403)
    
    query = sanitize_input(request.data.get('query'))
    history = request.data.get('history', [])
    ui_context = request.data.get('context', {}) # {active_tab: '...', selected_date: '...'}
    
    if query is None:
        return Response({'error': 'Security Protocol Violation: Restricted keywords detected.'}, status=400)
    if not query:
        return Response({'error': 'A valid query is required'}, status=400)

    # 1. Gather context
    context_parts = []
    
    if user.role == 'PARENT':
        parent = getattr(user, 'parent_profile', None)
        if not parent: return Response({'error': 'Parent profile not found'}, status=404)
        targets = parent.children.all()
    else:
        student = getattr(user, 'student_profile', None)
        if not student: return Response({'error': 'Student profile not found'}, status=404)
        targets = [student]

    from django.utils import timezone
    now = timezone.now()
    today = now.date()
    
    for target in targets:
        org_name = target.organization.name if target.organization else "Your School"
        target_context = f"!!! IMPORTANT: TODAY IS {now.strftime('%Y-%m-%d')}. ANY DATE BEFORE THIS IS IN THE PAST !!!\n"
        target_context += f"School: {org_name} | Student: {target.first_name} {target.last_name}\n"
        target_context += f"USER_UI_STATE: Currently viewing the {ui_context.get('active_tab', 'N/A')} section. Their screen is currently focused on the date: {ui_context.get('selected_date', 'N/A')}\n\n"
        
        if target.classroom:
            # 0. Instructors
            subjects = Subject.objects.filter(classroom=target.classroom)
            target_context += "INSTRUCTORS:\n"
            for sub in subjects:
                instrs = ", ".join([f"{i.user.first_name} {i.user.last_name}" for i in sub.instructors.all()])
                target_context += f"- {sub.name}: {instrs}\n"
            
            # 1. Active Homework
            pending_hw = Homework.objects.filter(
                session__timetable__subject__classroom=target.classroom,
                deadline__gte=now
            ).order_by('deadline')
            
            target_context += "\n[ACTIVE HOMEWORK - DUE SOON]:\n"
            if pending_hw.exists():
                for hw in pending_hw:
                    target_context += f"- {hw.title} (DUE: {hw.deadline.strftime('%Y-%m-%d')})\n"
            else:
                target_context += "- None (All caught up!)\n"

            # 2. History
            past_hw = Homework.objects.filter(
                session__timetable__subject__classroom=target.classroom,
                deadline__lt=now
            ).order_by('-deadline')[:3]
            
            target_context += "\n[OLD / COMPLETED HISTORY]:\n"
            for hw in past_hw:
                 target_context += f"- {hw.title} (FINISHED: {hw.deadline.strftime('%Y-%m-%d')})\n"

            # 3. Lessons
            tasks = DailyTask.objects.filter(classroom=target.classroom).order_by('-date')[:5]
            target_context += "\n[RECENT LESSONS]:\n"
            for t in tasks:
                target_context += f"- {t.date}: {t.topic}\n"
        
        # Advanced context search (Keyword-RAG)
        # Extract meaningful keywords from query for deeper search
        keywords = [w for w in query.split() if len(w) > 3]
        extra_context = ""
        if keywords and target.classroom:
            from django.db.models import Q
            task_query = Q()
            hw_query = Q()
            for kw in keywords:
                task_query |= Q(topic__icontains=kw) | Q(description__icontains=kw)
                hw_query |= Q(title__icontains=kw) | Q(description__icontains=kw)
            
            relevant_tasks = DailyTask.objects.filter(classroom=target.classroom).filter(task_query).distinct()[:5]
            relevant_hw = Homework.objects.filter(session__timetable__subject__classroom=target.classroom).filter(hw_query).distinct()[:5]
            
            if relevant_tasks.exists() or relevant_hw.exists():
                extra_context += "\n[MATCHING HISTORICAL RECORDS]:\n"
                for rt in relevant_tasks:
                   extra_context += f"- Classwork Date: {rt.date} | Topic: {rt.topic} (Summary: {rt.description})\n"
                for hw in relevant_hw:
                   extra_context += f"- Past Homework: {hw.title} (Deadline: {hw.deadline.strftime('%Y-%m-%d')})\n"
        
        target_context += extra_context
        context_parts.append(target_context)
    
    full_context = "\n".join(context_parts)
    
    # 2. Call Gemini
    api_key = os.getenv('GEMINI_API_KEY')
    model_name = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash').strip()
    
    # Ensure model_name just has the ID if it was prefixed
    if "/" in model_name:
        model_name = model_name.split("/")[-1]

    if not api_key or api_key == 'your_gemini_api_key_here':
         return Response({'answer': "Gemini API key is not configured. Please add it to the .env file."})

    try:
        base_dir = os.path.dirname(__file__)
        prompt_path = os.path.join(base_dir, 'ai_prompts', 'parent_assistant.txt')
        
        if not os.path.exists(prompt_path):
            return Response({'error': f'Configuration Error: Prompt template missing at {prompt_path}'}, status=500)

        with open(prompt_path, 'r', encoding='utf-8') as f:
            prompt_template = f.read()
        
        # 2. Setup AI Persona and System Instructions
        system_instruction = prompt_template.split("### CONTEXT")[0].strip().format(today=today.strftime('%Y-%m-%d'))
        
        # 3. Create Client and Chat
        client = genai.Client(api_key=api_key)
        final_prompt = prompt_template.format(context=full_context, query=query, today=today.strftime('%Y-%m-%d'))
        
        # Format history turns correctly for the SDK
        chat_history = []
        for h in history[-8:]: # Keep slightly more history for better NLP context
             chat_history.append({
                 'role': 'user' if h['role'] == 'user' else 'model',
                 'parts': [{'text': h['text']}]
             })
        
        # The user's current message contains the fresh context and the query
        current_query_with_context = f"### CONTEXT\n{full_context}\n\n### USER QUERY\n{query}"
        
        # Final call using system_instruction for identity and history for thread
        try:
            # We try with system_instruction first (Modern Gemini way)
            response = client.models.generate_content(
                model=model_name,
                contents=chat_history + [{'role': 'user', 'parts': [{'text': current_query_with_context}]}],
                config={
                    'system_instruction': system_instruction,
                    'temperature': 0.3,
                    'top_p': 0.8,
                }
            )
        except Exception as e:
            # Fallback for models that don't support system_instruction (like Gemma)
            if "Developer instruction" in str(e) or "INVALID_ARGUMENT" in str(e):
                combined_query = f"{system_instruction}\n\n{current_query_with_context}"
                response = client.models.generate_content(
                    model=model_name,
                    contents=chat_history + [{'role': 'user', 'parts': [{'text': combined_query}]}],
                    config={
                        'temperature': 0.3,
                        'top_p': 0.8,
                    }
                )
            else:
                raise e # Re-raise if it's a different error
        
        if not response or not response.text:
            return Response({'error': 'The AI returned an empty response. Please try a more specific question.'}, status=500)

        # Ensure plain text (strip markdown if necessary)
        try:
            import re
            r = response.text
            r = r.replace('**', '').replace('__', '').replace('`', '').replace('_', '')
            r = r.replace('###', ' ').replace('##', ' ').replace('#', ' ')
            r = re.sub(r'^\s*\*\s+', '- ', r, flags=re.MULTILINE)
            r = r.replace('*', '')
            r = re.sub(r'\n{3,}', '\n\n', r)
            return Response({'answer': r.strip()})
        except Exception as text_err:
            return Response({'error': 'The AI response is being processed differently. Please refresh.'}, status=500)

    except Exception as e:
        error_msg = str(e)
        print(f"AI Assistant Error: {error_msg}")
        # Standard user-friendly error message
        return Response({'error': 'The AI assistant is taking a short break to process the new curriculum. Please try again in a moment.'}, status=500)

def trigger_webhook(instance, action='created'):
    if not instance.organization.webhook_url:
        return
    
    def send_request():
        payload = {
            'action': action,
            'task': {
                'id': instance.id,
                'topic': instance.topic,
                'category': instance.category,
                'category_display': instance.get_category_display(),
                'date': str(instance.date),
                'description': instance.description,
                'deadline': str(instance.deadline) if instance.deadline else None,
                'subject': instance.subject.name if instance.subject else None,
                'classroom': instance.classroom.name if instance.classroom else None,
                'instructor': instance.instructor.user.username if instance.instructor else "Unknown",
                'organization': instance.organization.name
            }
        }
        try:
            requests.post(instance.organization.webhook_url, json=payload, timeout=10)
        except:
            pass
    threading.Thread(target=send_request).start()

def get_query_param(request, key):
    val = request.query_params.get(key)
    if val in ['undefined', 'null', '']:
        return None
    return val

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'ADMIN'

class IsManagerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'MANAGER'

class ClassroomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassroomSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        qs = Classroom.objects.all()
        if user.role == 'INSTRUCTOR':
            from django.db.models import Q
            return qs.filter(Q(instructors__user=user) | Q(subjects__instructors__user=user)).distinct()
        if user.role == 'STUDENT':
            student = getattr(user, 'student_profile', None)
            if student and student.classroom:
                return qs.filter(id=student.classroom.id)
        
        org = get_query_param(self.request, 'organization')
        if org: qs = qs.filter(organization_id=org)
        return qs

class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        qs = Subject.objects.all()
        if user.role == 'INSTRUCTOR':
            return qs.filter(instructors__user=user)
        if user.role == 'STUDENT':
            student = getattr(user, 'student_profile', None)
            if student and student.classroom:
                return qs.filter(classroom=student.classroom)
        if user.role == 'MANAGER':
            org = getattr(user, 'managed_org', None)
            if org: qs = qs.filter(organization=org)
        
        # Additional manual filters
        org_param = get_query_param(self.request, 'organization')
        if org_param: qs = qs.filter(organization_id=org_param)
        classroom = get_query_param(self.request, 'classroom')
        if classroom: qs = qs.filter(classroom_id=classroom)
        is_template = get_query_param(self.request, 'is_template')
        if is_template is not None:
            qs = qs.filter(is_template=(is_template.lower() == 'true'))
        return qs

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class OrganizationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Organization.objects.all()
        return Organization.objects.filter(manager=user)

    @action(detail=True, methods=['POST'])
    def generate_license(self, request, pk=None):
        import uuid
        org = self.get_object()
        if not org.is_payment_verified:
            return Response({'error': 'Payment not verified'}, status=400)
        
        license_key = f"DT-{str(uuid.uuid4())[:13].upper()}"
        org.license_key = license_key
        org.is_license_generated = True
        org.save()
        return Response({'license_key': license_key})

    @action(detail=True, methods=['POST'])
    def activate_portal(self, request, pk=None):
        from django.utils import timezone
        from datetime import timedelta
        org = self.get_object()
        key = request.data.get('license_key')
        if key == org.license_key:
            org.has_portal_access = True
            org.subscription_plan = 'PREMIUM'
            org.subscription_expiry = timezone.now() + timedelta(days=org.subscription_duration_months * 30)
            org.save()
            return Response({'status': 'activated', 'plan': org.subscription_plan})
        return Response({'error': 'Invalid License Key'}, status=400)

    @action(detail=False, methods=['GET'])
    def mine(self, request):
        user = request.user
        if user.role == 'ADMIN':
            org = Organization.objects.first()
        else:
            org = Organization.objects.filter(manager=user).first()
            if not org:
                # Fallback for students/instructors checking their org
                if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
                    org = user.student_profile.organization
                elif user.role == 'INSTRUCTOR' and hasattr(user, 'instructor_profile'):
                    org = user.instructor_profile.organization
        
        if org:
            return Response(self.get_serializer(org).data)
        return Response({'error': 'No organization found'}, status=404)

    def perform_destroy(self, instance):
        # Disable the manager
        if instance.manager:
            instance.manager.is_active = False
            instance.manager.save()
        
        # Disable all related users
        for s in Student.objects.filter(organization=instance):
            if s.user:
                s.user.is_active = False
                s.user.save()
        for i in Instructor.objects.filter(organization=instance):
            if i.user:
                i.user.is_active = False
                i.user.save()
        instance.delete()

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Student.objects.all()
        
        if user.role == 'ADMIN':
            org_id = get_query_param(self.request, 'organization')
            if org_id: qs = qs.filter(organization_id=org_id)
            return qs
        
        if user.role == 'MANAGER':
            org = getattr(user, 'managed_org', None)
            if org:
                qs = qs.filter(organization=org)
                classroom = get_query_param(self.request, 'classroom')
                if classroom: qs = qs.filter(classroom_id=classroom)
                return qs
        
        if user.role == 'INSTRUCTOR':
            instructor = getattr(user, 'instructor_profile', None)
            if instructor:
                from django.db.models import Q
                qs = qs.filter(Q(classroom__instructors=instructor) | Q(classroom__subjects__instructors=instructor)).distinct()
                
                # Apply specific classroom filter if provided in query params
                room_id = get_query_param(self.request, 'classroom')
                if room_id:
                    qs = qs.filter(classroom_id=room_id)
                return qs
        
        if user.role == 'STUDENT':
            student = getattr(user, 'student_profile', None)
            if student:
                # Return their own profile first or exclusively
                return qs.filter(user=user)

        return Student.objects.none()

    def perform_create(self, serializer):
        data = self.request.data
        first_name = data.get('first_name', 'Student')
        reg_no = data.get('registration_number', '000')
        username = f"{first_name.lower()}_{reg_no}"
        password = f"Pass@{reg_no}"
        
        # Auto-assign org for managers
        org_id = data.get('organization')
        if not org_id and self.request.user.role == 'MANAGER':
            org = getattr(self.request.user, 'managed_org', None)
            if org:
                org_id = org.id

        user, created = User.objects.get_or_create(username=username, defaults={'role': 'STUDENT'})
        user.set_password(password)
        user.is_active = True
        user.save()
            
        instance = serializer.save(user=user, organization_id=org_id)
        # Inject transient fields for the response
        instance.generated_username = username
        instance.generated_password = password

    @action(detail=False, methods=['GET'], permission_classes=[permissions.AllowAny])
    def download_template(self, request):
        import csv
        from django.http import HttpResponse
        org_id = request.query_params.get('organization')
        org = Organization.objects.get(id=org_id)
        headers = ['first_name', 'last_name', 'registration_number', 'classroom_name']
        for field in org.student_fields_config:
            headers.append(f"custom_{field['name']}")
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="student_template_{org.name}.csv"'
        writer = csv.writer(response)
        writer.writerow(headers)
        return response

    @action(detail=False, methods=['POST'])
    def bulk_import(self, request):
        import csv, io
        org_id = request.data.get('organization')
        file = request.FILES.get('file')
        reader = csv.DictReader(io.StringIO(file.read().decode('utf-8')))
        for row in reader:
            room, _ = Classroom.objects.get_or_create(name=row.get('classroom_name'), organization_id=org_id)
            
            first_name = row.get('first_name', 'Student')
            reg_no = row.get('registration_number', '000')
            username = f"{first_name.lower()}_{reg_no}"
            password = f"Pass@{reg_no}"

            user, _ = User.objects.get_or_create(username=username, defaults={'role': 'STUDENT'})
            user.set_password(password)
            user.is_active = True
            user.save()
            
            custom_data = {k.replace('custom_',''): v for k, v in row.items() if k.startswith('custom_')}
            Student.objects.create(
                user=user, 
                first_name=first_name, 
                last_name=row.get('last_name', ''), 
                registration_number=reg_no, 
                organization_id=org_id, 
                classroom=room, 
                custom_data=custom_data
            )
        return Response({'message': 'Import successful'})

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        if user:
            user.delete()

    @action(detail=True, methods=['POST'])
    def revoke(self, request, pk=None):
        instance = self.get_object()
        if instance.user:
            instance.user.is_active = False
            instance.user.save()
            return Response({'status': 'access revoked'})
        return Response({'error': 'no associated user'}, status=400)

    @action(detail=True, methods=['POST'])
    def activate(self, request, pk=None):
        instance = self.get_object()
        if instance.user:
            instance.user.is_active = True
            instance.user.save()
            return Response({'status': 'access restored'})
        return Response({'error': 'no associated user'}, status=400)
            
class TimetableViewSet(viewsets.ModelViewSet):
    serializer_class = TimetableSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Timetable.objects.all()
        user = self.request.user
        
        # Enforce Role-Based Access
        if user.role == 'STUDENT':
            student = getattr(user, 'student_profile', None)
            if student:
                qs = qs.filter(subject__classroom=student.classroom)
            else:
                return Timetable.objects.none()
        elif user.role == 'INSTRUCTOR':
            instructor = getattr(user, 'instructor_profile', None)
            if instructor:
                # By default, show instructor's own timetable unless another filter is applied
                classroom = get_query_param(self.request, 'classroom')
                instr_id = get_query_param(self.request, 'instructor')
                if classroom:
                    qs = qs.filter(subject__classroom_id=classroom)
                elif instr_id:
                    qs = qs.filter(instructor_id=instr_id)
                else:
                    qs = qs.filter(instructor=instructor)
            else:
                return Timetable.objects.none()
        
        # Additional manual filters for Manager/Admin
        classroom = get_query_param(self.request, 'classroom')
        if classroom and user.role in ['MANAGER', 'ADMIN']: 
            qs = qs.filter(subject__classroom_id=classroom)
            
        instructor = get_query_param(self.request, 'instructor')
        if instructor and user.role in ['MANAGER', 'ADMIN']: 
            qs = qs.filter(instructor_id=instructor)
            
        org = get_query_param(self.request, 'organization')
        if org: 
            qs = qs.filter(organization_id=org)
        elif user.role != 'ADMIN':
            # Default to user's org if not specified
            if user.role == 'MANAGER':
                qs = qs.filter(organization__manager=user)
            elif user.role == 'STUDENT' and hasattr(user, 'student_profile'):
                qs = qs.filter(organization=user.student_profile.organization)
            elif user.role == 'INSTRUCTOR' and hasattr(user, 'instructor_profile'):
                qs = qs.filter(organization=user.instructor_profile.organization)

        return qs.distinct()

    def perform_create(self, serializer):
        subject = serializer.validated_data['subject']
        instructor = serializer.validated_data.get('instructor')
        day = serializer.validated_data['day_of_week']
        start = serializer.validated_data['start_time']
        
        # If a specific instructor is assigned, check only their clashes
        if instructor:
            clashes = Timetable.objects.filter(instructor=instructor, day_of_week=day, start_time=start)
            if clashes.exists():
                raise serializers.ValidationError({"error": f"Clash! Instructor {instructor.registration_number} is already in {clashes[0].subject.classroom.name} for {clashes[0].subject.name}."})
        else:
            # Fallback for generic subject assignment (if any)
            instructors = subject.instructors.all()
            for inst in instructors:
                clashes = Timetable.objects.filter(instructor=inst, day_of_week=day, start_time=start)
                if clashes.exists():
                    raise serializers.ValidationError({"error": f"Clash! Instructor {inst.registration_number} is already in {clashes[0].subject.classroom.name} for {clashes[0].subject.name}."})
        
        serializer.save()

class ClassSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = ClassSession.objects.all()
        classroom = get_query_param(self.request, 'classroom')
        if classroom: qs = qs.filter(timetable__subject__classroom_id=classroom)
        return qs

class HomeworkViewSet(viewsets.ModelViewSet):
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Homework.objects.all()
        classroom = get_query_param(self.request, 'classroom')
        if classroom: qs = qs.filter(session__timetable__subject__classroom_id=classroom)
        return qs

class InstructorViewSet(viewsets.ModelViewSet):
    serializer_class = InstructorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Instructor.objects.all()
        if user.role == 'ADMIN':
            org_id = get_query_param(self.request, 'organization')
            if org_id:
                qs = qs.filter(organization_id=org_id)
            return qs
        
        if user.role == 'MANAGER':
            org = getattr(user, 'managed_org', None)
            if org:
                return qs.filter(organization=org)
        
        if user.role == 'INSTRUCTOR':
            # Allow instructor to see their own profile
            return qs.filter(user=user)
        
        return Instructor.objects.none()

    def perform_destroy(self, instance):
        user = instance.user
        instance.delete()
        if user:
            user.delete()

    @action(detail=True, methods=['POST'])
    def revoke(self, request, pk=None):
        instance = self.get_object()
        if instance.user:
            # 1. Disable Login
            instance.user.is_active = False
            instance.user.save()
            
            # 2. Clear Associations (Remove from active duty)
            # We keep DailyTasks and materials (ForeignKeys) because they belong to the record,
            # but we remove them from active subject/classroom rosters (ManyToMany)
            instance.taught_subjects.clear()
            instance.classrooms.clear()
            
            return Response({'status': 'access revoked and responsibilities cleared'})
        return Response({'error': 'no associated user'}, status=400)

    @action(detail=True, methods=['POST'])
    def activate(self, request, pk=None):
        instance = self.get_object()
        if instance.user:
            instance.user.is_active = True
            instance.user.save()
            return Response({'status': 'access restored'})
        return Response({'error': 'no associated user'}, status=400)

    def perform_create(self, serializer):
        user_data = self.request.data.get('user_data', {})
        username = user_data.get('username') or f"inst_{self.request.data.get('registration_number') or '000'}"
        password = user_data.get('password') or "Pass@123"
        user, _ = User.objects.get_or_create(username=username, defaults={'role': 'INSTRUCTOR'})
        user.set_password(password)
        user.is_active = True
        user.save()
        serializer.save(user=user)

    @action(detail=False, methods=['GET'], permission_classes=[permissions.AllowAny])
    def download_template(self, request):
        import csv
        from django.http import HttpResponse
        org_id = request.query_params.get('organization')
        org = Organization.objects.get(id=org_id)
        headers = ['username', 'registration_number', 'designation']
        for field in org.instructor_fields_config:
            headers.append(f"custom_{field['name']}")
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="instructor_template_{org.name}.csv"'
        writer = csv.writer(response)
        writer.writerow(headers)
        return response

    @action(detail=False, methods=['POST'])
    def bulk_import(self, request):
        import csv, io
        org_id = request.data.get('organization')
        file = request.FILES.get('file')
        decoded_file = file.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded_file))
        for row in reader:
            username = row.get('username')
            reg_no = row.get('registration_number')
            user, _ = User.objects.get_or_create(username=username, defaults={'role': 'INSTRUCTOR'})
            user.set_password(f"Pass@{reg_no}")
            user.is_active = True
            user.save()
            custom_data = {k.replace('custom_',''): v for k, v in row.items() if k.startswith('custom_')}
            Instructor.objects.create(user=user, organization_id=org_id, registration_number=reg_no, designation=row.get('designation'), custom_data=custom_data)
        return Response({'message': 'Import successful'})

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Google Drive service stub
    def perform_create(self, serializer):
        # file = self.request.FILES.get('file')
        # if file:
        #     file_url = upload_to_drive(file)
        #     serializer.save(file_url=file_url)
        serializer.save()

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def organizer_signup(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    org_name = request.data.get('org_name', f"{username}'s Organization")

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password, role='MANAGER')
    org = Organization.objects.create(name=org_name, manager=user, has_portal_access=False)
    
    return Response({'message': 'Organizer and organization created. Waiting for admin approval.'}, status=status.HTTP_201_CREATED)

class DailyTaskViewSet(viewsets.ModelViewSet):
    serializer_class = DailyTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = DailyTask.objects.all()
        
        # Filtering
        org = get_query_param(self.request, 'organization')
        if org: qs = qs.filter(organization_id=org)
        
        classroom = get_query_param(self.request, 'classroom')
        if classroom: qs = qs.filter(classroom_id=classroom)
        
        date = get_query_param(self.request, 'date')
        if date: qs = qs.filter(date=date)
        
        if user.role == 'MANAGER':
            org_obj = getattr(user, 'managed_org', None)
            if org_obj: qs = qs.filter(organization=org_obj)
        elif user.role == 'INSTRUCTOR':
            instructor = getattr(user, 'instructor_profile', None)
            if instructor:
                from django.db.models import Q
                qs = qs.filter(Q(classroom__instructors=instructor) | Q(subject__instructors=instructor)).distinct()
        elif user.role == 'STUDENT':
            student = getattr(user, 'student_profile', None)
            if student and student.classroom:
                qs = qs.filter(classroom=student.classroom)
        
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'INSTRUCTOR':
            instructor = getattr(user, 'instructor_profile', None)
            org = instructor.organization
            instance = serializer.save(instructor=instructor, organization=org)
        else:
            instance = serializer.save()
        trigger_webhook(instance, action='created')

    def perform_update(self, serializer):
        instance = serializer.save()
        trigger_webhook(instance, action='updated')

    def perform_destroy(self, instance):
        trigger_webhook(instance, action='deleted')
        instance.delete()

