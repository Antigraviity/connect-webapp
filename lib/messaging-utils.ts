/**
 * Messaging Helper Utilities
 * Use these functions to integrate messaging throughout your app
 */

/**
 * Create a conversation between two users
 * @param currentUserId - The ID of the current user
 * @param otherUserId - The ID of the other user
 * @param jobId - Optional job ID for context
 * @param initialMessage - Optional first message
 * @returns Promise with conversation data
 */
export async function createConversation(
  currentUserId: string,
  otherUserId: string,
  jobId?: string,
  initialMessage?: string
) {
  try {
    const response = await fetch('/api/job-messages/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUserId,
        otherUserId,
        jobId: jobId || null,
        initialMessage: initialMessage || null,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Send a message in an existing conversation
 * @param conversationId - The conversation ID
 * @param userId - The sender's user ID
 * @param content - Message text
 * @param attachments - Optional file attachments
 * @returns Promise with message data
 */
export async function sendMessage(
  conversationId: string,
  userId: string,
  content: string,
  attachments?: Array<{ name: string; url: string; type: string; size: number }>
) {
  try {
    const response = await fetch(`/api/job-messages/${conversationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        content,
        attachments: attachments || null,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Upload a file for messaging
 * @param file - The file to upload
 * @returns Promise with file info (url, name, type, size)
 */
export async function uploadMessageFile(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/job-messages/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Get total unread message count for a user
 * @param userId - The user ID
 * @returns Promise with unread count
 */
export async function getUnreadCount(userId: string) {
  try {
    const response = await fetch(`/api/job-messages/conversations?userId=${userId}`);
    const data = await response.json();
    
    if (data.success) {
      const total = data.conversations.reduce(
        (sum: number, conv: any) => sum + conv.unreadCount,
        0
      );
      return total;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Example usage in a Job Details component:
 * 
 * import { createConversation } from '@/lib/messaging-utils';
 * 
 * async function handleMessageEmployer() {
 *   const user = JSON.parse(localStorage.getItem('user'));
 *   
 *   const result = await createConversation(
 *     user.id,
 *     job.employerId,
 *     job.id,
 *     `Hi, I'm interested in the ${job.title} position.`
 *   );
 *   
 *   if (result.success) {
 *     router.push('/buyer/messages/jobs');
 *   }
 * }
 */

/**
 * Example usage for unread badge in navigation:
 * 
 * const [unreadCount, setUnreadCount] = useState(0);
 * 
 * useEffect(() => {
 *   const user = JSON.parse(localStorage.getItem('user'));
 *   if (user) {
 *     getUnreadCount(user.id).then(setUnreadCount);
 *     
 *     // Poll every 10 seconds
 *     const interval = setInterval(() => {
 *       getUnreadCount(user.id).then(setUnreadCount);
 *     }, 10000);
 *     
 *     return () => clearInterval(interval);
 *   }
 * }, []);
 * 
 * // Then in your nav:
 * <Link href="/buyer/messages/jobs">
 *   Messages
 *   {unreadCount > 0 && (
 *     <span className="badge">{unreadCount}</span>
 *   )}
 * </Link>
 */
