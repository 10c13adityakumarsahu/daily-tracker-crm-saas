import sys
import os
sys.path.append(os.getcwd())
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import *
s = Student.objects.first()
if s:
    print(f"Student: {s.first_name} {s.last_name}")
    print(f"Classroom: {s.classroom.name if s.classroom else 'None'}")
    if s.classroom:
        print(f"Tasks in room: {DailyTask.objects.filter(classroom=s.classroom).count()}")
else:
    print("No students found.")
