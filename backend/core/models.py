import os
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Organization Manager'),
        ('INSTRUCTOR', 'Instructor'),
        ('PARENT', 'Parent'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ADMIN')

class Organization(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    manager = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, related_name='managed_org')
    has_portal_access = models.BooleanField(default=False) # Requires admin approval
    address = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    subscription_plan = models.CharField(max_length=50, default='TRIAL')
    license_key = models.CharField(max_length=100, blank=True, unique=True, null=True)
    subscription_duration_months = models.IntegerField(default=1)
    subscription_expiry = models.DateTimeField(null=True, blank=True)
    is_payment_verified = models.BooleanField(default=False)
    is_license_generated = models.BooleanField(default=False)
    student_fields_config = models.JSONField(default=list, blank=True)
    instructor_fields_config = models.JSONField(default=list, blank=True)
    licensing_details = models.JSONField(default=dict, blank=True)

class Instructor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='instructors')
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    designation = models.CharField(max_length=255, blank=True)
    custom_data = models.JSONField(default=dict, blank=True)
    
class Classroom(models.Model):
    name = models.CharField(max_length=255) # e.g. "Class 10A"
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='classrooms')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=255) # e.g. "Mathematics"
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='subjects')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True, blank=True, related_name='taught_subjects')

    def __str__(self):
        return f"{self.name} ({self.classroom.name if self.classroom else 'No Class'})"

class Parent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='parents')
    custom_data = models.JSONField(default=dict, blank=True)

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='students')
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    parent = models.ForeignKey(Parent, on_delete=models.SET_NULL, null=True, related_name='children')
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True, related_name='students_mentored')
    custom_data = models.JSONField(default=dict, blank=True)
    org_custom_fields_config = models.JSONField(default=list, blank=True)

class Timetable(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE)
    subject = models.CharField(max_length=255)
    day_of_week = models.IntegerField(choices=[(i, i) for i in range(7)]) # 0=Monday
    start_time = models.TimeField()
    end_time = models.TimeField()

class ClassSession(models.Model):
    timetable = models.ForeignKey(Timetable, on_delete=models.CASCADE, related_name='sessions')
    date = models.DateField()
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Attendance(models.Model):
    session = models.ForeignKey(ClassSession, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    is_present = models.BooleanField(default=True)

class Homework(models.Model):
    session = models.ForeignKey(ClassSession, on_delete=models.CASCADE, related_name='homeworks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    deadline = models.DateTimeField()
    completed_by = models.ManyToManyField(Student, blank=True, related_name='completed_homeworks')

class Material(models.Model):
    session = models.ForeignKey(ClassSession, on_delete=models.CASCADE, related_name='materials')
    name = models.CharField(max_length=255)
    file_url = models.URLField() # Could be Google Drive URL
    uploaded_at = models.DateTimeField(auto_now_add=True)
