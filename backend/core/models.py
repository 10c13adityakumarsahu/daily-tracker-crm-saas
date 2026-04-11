import os
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Organization Manager'),
        ('INSTRUCTOR', 'Instructor'),
        ('STUDENT', 'Student'),
        ('PARENT', 'Parent'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ADMIN')

class Organization(models.Model):
    name = models.CharField(max_length=255)
    manager = models.OneToOneField(User, on_delete=models.CASCADE, related_name='managed_org')
    
    # Scheduling Config
    school_start_time = models.TimeField(null=True, blank=True, default='08:30:00')
    school_end_time = models.TimeField(null=True, blank=True, default='15:30:00')
    period_duration_minutes = models.IntegerField(null=True, blank=True, default=45)
    break_duration_minutes = models.IntegerField(null=True, blank=True, default=15)
    break_after_period = models.IntegerField(null=True, blank=True, default=3) 
    
    # Meta / Subscription
    subscription_plan = models.CharField(max_length=50, default='FREE')
    subscription_expiry = models.DateTimeField(null=True, blank=True)
    subscription_duration_months = models.IntegerField(default=12) # For payment calculation
    is_payment_verified = models.BooleanField(default=False)
    license_key = models.CharField(max_length=100, blank=True, null=True)
    is_license_generated = models.BooleanField(default=False)
    has_portal_access = models.BooleanField(default=False) # Only if key applied

    # Custom Field Configurations (JSON storage for flexibility)
    student_fields_config = models.JSONField(default=list, blank=True)
    instructor_fields_config = models.JSONField(default=list, blank=True)
    custom_intervals = models.JSONField(default=list, blank=True) # [{name, start, end}]
    licensing_details = models.JSONField(default=dict, blank=True)
    webhook_url = models.URLField(max_length=500, blank=True, null=True)

class Instructor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='instructors')
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    designation = models.CharField(max_length=255, blank=True, null=True)
    custom_data = models.JSONField(default=dict, blank=True)
    classrooms = models.ManyToManyField('Classroom', related_name='instructors', blank=True)
    
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
    instructors = models.ManyToManyField(Instructor, related_name='taught_subjects', blank=True)
    is_template = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.classroom:
            self.is_template = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.classroom.name if self.classroom else ('Template' if self.is_template else 'No Class')})"

class Parent(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='parents')
    custom_data = models.JSONField(default=dict, blank=True)

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='students')
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    parent = models.ForeignKey(Parent, on_delete=models.SET_NULL, null=True, related_name='children')
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True, related_name='students_mentored')
    custom_data = models.JSONField(default=dict, blank=True)
    org_custom_fields_config = models.JSONField(default=list, blank=True)

class Timetable(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='timetables')
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

class DailyTask(models.Model):
    CATEGORY_CHOICES = (
        ('CW', 'Classwork'),
        ('HW', 'Homework'),
        ('PROJECT', 'Project'),
        ('ASSIGNMENT', 'Assignment'),
    )
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='daily_tasks')
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='daily_tasks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='daily_tasks')
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE, related_name='created_tasks')
    
    date = models.DateField()
    topic = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True, null=True)
    deadline = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category}: {self.topic} ({self.date})"
