#!/usr/bin/env python3
"""
AI Learning Platform - User Statistics Script
This script shows statistics about registered users.
"""

import json
import os
from datetime import datetime

def load_users():
    """Load users from the JSON file"""
    users_file = 'backend/users.json'
    if os.path.exists(users_file):
        with open(users_file, 'r') as f:
            return json.load(f)
    return {}

def format_date(date_string):
    """Format ISO date string to readable format"""
    if not date_string:
        return "Unknown"
    try:
        dt = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except:
        return date_string

def display_user_stats():
    """Display comprehensive user statistics"""
    print("=" * 60)
    print("🚀 AI PERSONALIZED LEARNING PLATFORM")
    print("📊 USER STATISTICS DASHBOARD")
    print("=" * 60)
    
    users = load_users()
    
    if not users:
        print("❌ No users found!")
        print("   Make sure users.json exists in the backend folder.")
        return
    
    total_users = len(users)
    total_learning_hours = 0
    total_courses = 0
    total_achievements = 0
    
    print(f"\n📈 SUMMARY:")
    print(f"   Total Registered Users: {total_users}")
    
    print(f"\n👥 USER DETAILS:")
    print("-" * 60)
    
    for i, (email, user_data) in enumerate(users.items(), 1):
        name = user_data.get('name', 'No name provided')
        created_at = user_data.get('created_at', '')
        profile = user_data.get('profile', {})
        
        learning_hours = profile.get('learning_hours', 0)
        courses_completed = profile.get('courses_completed', 0)
        achievements = len(profile.get('achievements', []))
        
        total_learning_hours += learning_hours
        total_courses += courses_completed
        total_achievements += achievements
        
        print(f"{i}. 📧 Email: {email}")
        print(f"   👤 Name: {name}")
        print(f"   📅 Joined: {format_date(created_at)}")
        print(f"   ⏱️  Learning Hours: {learning_hours}")
        print(f"   📚 Courses Completed: {courses_completed}")
        print(f"   🏆 Achievements: {achievements}")
        print("-" * 60)
    
    print(f"\n🎯 PLATFORM TOTALS:")
    print(f"   📊 Total Learning Hours: {total_learning_hours}")
    print(f"   📚 Total Courses Completed: {total_courses}")
    print(f"   🏆 Total Achievements: {total_achievements}")
    print(f"   📈 Average Hours per User: {total_learning_hours/total_users:.1f}")
    
    print(f"\n💾 DATA LOCATION:")
    print(f"   File: backend/users.json")
    print(f"   Size: {os.path.getsize('backend/users.json') if os.path.exists('backend/users.json') else 0} bytes")
    
    print("\n" + "=" * 60)

def export_user_data():
    """Export user data to a formatted file"""
    users = load_users()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"user_export_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump(users, f, indent=2)
    
    print(f"✅ User data exported to: {filename}")

def main():
    """Main function"""
    while True:
        print("\n🔧 AI Learning Platform - Admin Tools")
        print("1. 📊 Show User Statistics")
        print("2. 💾 Export User Data")
        print("3. 🔄 Refresh Data")
        print("4. ❌ Exit")
        
        choice = input("\nSelect an option (1-4): ").strip()
        
        if choice == '1':
            display_user_stats()
        elif choice == '2':
            export_user_data()
        elif choice == '3':
            print("🔄 Refreshing data...")
            display_user_stats()
        elif choice == '4':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid option. Please try again.")

if __name__ == "__main__":
    main()
