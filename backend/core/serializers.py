from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # We check for active status manually to provide the specific "Access Revoked" message
        try:
            user = User.objects.filter(username=attrs.get('username')).first()
            if user and not user.is_active:
                raise AuthenticationFailed("Access Revoked: Your portal access has been suspended by the administrator.")
        except AuthenticationFailed:
            raise
        except Exception:
            pass

        data = super().validate(attrs)
        user = self.user
        
        if user.role in ['PARENT', 'INSTRUCTOR', 'STUDENT']:
            org = None
            if hasattr(user, 'parent_profile'):
                org = user.parent_profile.organization
            elif hasattr(user, 'instructor_profile'):
                org = user.instructor_profile.organization
            elif hasattr(user, 'student_profile'):
                org = user.student_profile.organization
            
            if org and not org.has_portal_access:
                raise AuthenticationFailed("Organization access is pending or denied.")
                
        data['role'] = user.role
        if user.role == 'MANAGER' and hasattr(user, 'managed_org'):
            org = user.managed_org
            data['has_portal_access'] = org.has_portal_access
            data['subscription_plan'] = org.subscription_plan
            if org.subscription_expiry:
                from django.utils import timezone
                delta = org.subscription_expiry - timezone.now()
                data['days_left'] = max(0, delta.days)
            else:
                data['days_left'] = None
        else:
            data['has_portal_access'] = True
            
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    classroom_name = serializers.ReadOnlyField(source='classroom.name')
    instructor_names = serializers.SerializerMethodField()
    class Meta:
        model = Subject
        fields = '__all__'
    
    def get_instructor_names(self, obj):
        return ", ".join([str(list(i.custom_data.values())[0]) if i.custom_data else str(i.registration_number) for i in obj.instructors.all()])

class InstructorSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    user_is_active = serializers.ReadOnlyField(source='user.is_active')
    class Meta:
        model = Instructor
        fields = '__all__'
        read_only_fields = ('user',)

class StudentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.ReadOnlyField(source='classroom.name')
    user_username = serializers.ReadOnlyField(source='user.username')
    user_is_active = serializers.ReadOnlyField(source='user.is_active')
    generated_username = serializers.CharField(read_only=True, required=False)
    generated_password = serializers.CharField(read_only=True, required=False)
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ('user',)

class TimetableSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    instructor_name = serializers.SerializerMethodField()
    class Meta:
        model = Timetable
        fields = '__all__'
    
    def get_instructor_name(self, obj):
        if not obj.instructor: return "Unassigned"
        i = obj.instructor
        return str(list(i.custom_data.values())[0]) if i.custom_data else str(i.registration_number)

class ClassSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSession
        fields = '__all__'

class HomeworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Homework
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class DailyTaskSerializer(serializers.ModelSerializer):
    subject_name = serializers.ReadOnlyField(source='subject.name')
    instructor_name = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    # Allow these to be set automatically in perform_create
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all(), required=False)
    instructor = serializers.PrimaryKeyRelatedField(queryset=Instructor.objects.all(), required=False)

    class Meta:
        model = DailyTask
        fields = '__all__'

    def get_instructor_name(self, obj):
        i = obj.instructor
        return str(list(i.custom_data.values())[0]) if i.custom_data else str(i.registration_number)
