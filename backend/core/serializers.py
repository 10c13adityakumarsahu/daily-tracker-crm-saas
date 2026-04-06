from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        if user.role in ['PARENT', 'INSTRUCTOR']:
            org = None
            if hasattr(user, 'parent_profile'):
                org = hasattr(user.parent_profile, 'organization') and user.parent_profile.organization
            elif hasattr(user, 'instructor_profile'):
                org = hasattr(user.instructor_profile, 'organization') and user.instructor_profile.organization
            
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
    instructor_name = serializers.ReadOnlyField(source='instructor.user.username')
    class Meta:
        model = Subject
        fields = '__all__'

class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.ReadOnlyField(source='classroom.name')
    generated_username = serializers.CharField(read_only=True, required=False)
    generated_password = serializers.CharField(read_only=True, required=False)
    class Meta:
        model = Student
        fields = '__all__'

class TimetableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timetable
        fields = '__all__'

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
