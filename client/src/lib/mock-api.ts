// Mock API interactions
export async function createPost(post: any) {
  console.log('Creating post:', post);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const savedPost = {
    ...post,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  
  // Store in localStorage for persistence in this session
  const posts = JSON.parse(localStorage.getItem('posts') || '[]');
  posts.push(savedPost);
  localStorage.setItem('posts', JSON.stringify(posts));
  
  return savedPost;
}
