import sys
import os
sys.path.append(os.getcwd())
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import *
print(f"Total Students: {Student.objects.count()}")
print(f"Total Classrooms: {Classroom.objects.count()}")
print(f"Total DailyTasks: {DailyTask.objects.count()}")
print(f"Total Homeworks: {Homework.objects.count()}")

for t in DailyTask.objects.all()[:5]:
    print(f"Task: {t.topic} in {t.classroom.name if t.classroom else 'None'}")
