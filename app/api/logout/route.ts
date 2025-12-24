import { NextResponse } from 'next/server';

export async function POST() {
  console.log('🚪 Logout API called');
  
  const response = NextResponse.json({ success: true });
  
  // Clear all authentication cookies
  const cookiesToClear = [
    'token',
    'glamai_token',
    '__Secure-next-auth.session-token',
    'remember_admin_59ba36addc2b2f9401580f014c7f58ea4e30989d'
  ];
  
  cookiesToClear.forEach(cookieName => {
    // Clear cookie with various configurations to ensure removal
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
      maxAge: 0
    });
    
    console.log(`✅ Cleared cookie: ${cookieName}`);
  });
  
  console.log('✅ All server-side cookies cleared');
  
  return response;
}
