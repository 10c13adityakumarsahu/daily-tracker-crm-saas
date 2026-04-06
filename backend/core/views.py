from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from .models import *
from .serializers import *

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
        org = self.request.query_params.get('organization')
        qs = Classroom.objects.all()
        if org: qs = qs.filter(organization_id=org)
        return qs

class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        qs = Subject.objects.all()
        if user.role == 'INSTRUCTOR':
            return qs.filter(instructor__user=user)
        if user.role == 'STUDENT':
            student = getattr(user, 'student_profile', None)
            if student and student.classroom:
                return qs.filter(classroom=student.classroom)
        org = self.request.query_params.get('organization')
        if org: qs = qs.filter(organization_id=org)
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

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Student.objects.all()
        if self.request.user.role == 'ADMIN':
            org_id = self.request.query_params.get('organization')
            if org_id:
                qs = qs.filter(organization_id=org_id)
            return qs
        
        if self.request.user.role == 'MANAGER':
            org = getattr(self.request.user, 'managed_org', None)
            if org:
                return qs.filter(organization=org)
        
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
        if created:
            user.set_password(password)
            user.save()
            
        instance = serializer.save(user=user, organization_id=org_id)
        # Inject transient fields for the response
        instance.generated_username = username
        instance.generated_password = password

    @action(detail=False, methods=['GET'])
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

class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer
    permission_classes = [permissions.IsAuthenticated]

class ClassSessionViewSet(viewsets.ModelViewSet):
    queryset = ClassSession.objects.all()
    serializer_class = ClassSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [permissions.IsAuthenticated]

class InstructorViewSet(viewsets.ModelViewSet):
    serializer_class = InstructorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Instructor.objects.all()
        if self.request.user.role == 'ADMIN':
            org_id = self.request.query_params.get('organization')
            if org_id:
                qs = qs.filter(organization_id=org_id)
            return qs
        
        if self.request.user.role == 'MANAGER':
            org = getattr(self.request.user, 'managed_org', None)
            if org:
                return qs.filter(organization=org)
        
        return Instructor.objects.none()

    def perform_create(self, serializer):
        user_data = self.request.data.get('user_data', {})
        username = user_data.get('username') or f"inst_{self.request.data.get('registration_number') or '000'}"
        password = user_data.get('password') or "Pass@123"
        user, _ = User.objects.get_or_create(username=username, defaults={'role': 'INSTRUCTOR'})
        user.set_password(password)
        user.save()
        serializer.save(user=user)

    @action(detail=False, methods=['GET'])
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
            user.set_password("Pass@123")
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

