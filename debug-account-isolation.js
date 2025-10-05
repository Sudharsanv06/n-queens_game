// Debug localStorage data and clear contaminated completions

console.log('=== DEBUGGING ACCOUNT ISOLATION ISSUE ===');

// Check current user
const currentUser = JSON.parse(localStorage.getItem('currentOfflineUser') || 'null');
console.log('Current User:', currentUser);

// Check global contaminated data
const globalCompletions = localStorage.getItem('completedChallenges');
console.log('Global completedChallenges (CONTAMINATED):', globalCompletions);

// Check all user-specific completions
const allKeys = Object.keys(localStorage);
const userCompletionKeys = allKeys.filter(key => key.startsWith('userCompletions_'));
console.log('User-specific completion keys:', userCompletionKeys);

userCompletionKeys.forEach(key => {
  const data = localStorage.getItem(key);
  console.log(`${key}:`, JSON.parse(data || '{}'));
});

// Check all users
const allUsers = JSON.parse(localStorage.getItem('offlineUsers') || '[]');
console.log('All registered users:', allUsers.map(u => ({ id: u.id, name: u.name })));

// CLEAN UP FUNCTION - Remove contaminated global data
function clearContaminatedData() {
  console.log('🧹 CLEARING CONTAMINATED GLOBAL DATA...');
  
  // Remove global completions that are causing data bleeding
  if (localStorage.getItem('completedChallenges')) {
    localStorage.removeItem('completedChallenges');
    console.log('✅ Removed global completedChallenges');
  } else {
    console.log('ℹ️ No global completedChallenges found');
  }
  
  // Optionally clear all user completions to start fresh
  // userCompletionKeys.forEach(key => {
  //   localStorage.removeItem(key);
  //   console.log(`✅ Removed ${key}`);
  // });
  
  console.log('🎉 Cleanup complete! Reload the page to see isolated accounts.');
}

// AUTO-RUN CLEANUP
clearContaminatedData();

console.log('=== DEBUG COMPLETE ===');