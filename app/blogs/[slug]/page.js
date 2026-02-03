import { notFound } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase12';
import { doc, getDoc } from 'firebase/firestore';

export async function generateStaticParams() {
  try {
    const querySnapshot = await getDocs(collection(db, "blog"));
    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (data.slug) {
          return { slug: data.slug };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

async function getBlogPost(slug) {
  console.log("Searching for slug:", slug);
  
  try {
    // Try by slug first
    const blogQuery = query(
      collection(db, "blog"),
      where("slug", "==", slug)
    );
    const querySnapshot = await getDocs(blogQuery);
    
    console.log("Query results:", querySnapshot.docs.length);
    
    if (!querySnapshot.empty) {
      const blog = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      console.log("Found blog:", blog);
      return blog;
    }
    
    // Fallback: try by document ID
    console.log("Trying by document ID:", slug);
    const docRef = doc(db, "blog", slug);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const blog = { id: docSnap.id, ...docSnap.data() };
      console.log("Found by ID:", blog);
      return blog;
    }
    
    console.log("Blog not found");
    return null;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

export default async function BlogPost({ params }) {
  // Unwrap the params Promise (Next.js 15+ fix)
  const resolvedParams = await params;
  console.log("Params received:", resolvedParams);
  
  const { slug } = resolvedParams || {};
  console.log("Extracted slug:", slug);
  
  const blog = await getBlogPost(slug);
  
  console.log("Blog data:", blog); // Add this line

  if (!blog) {
    console.log("No blog found, returning 404");
    notFound();
  }
    console.log("About to render JSX..."); // Add this line

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
          {blog.title}
        </h1>
        
        {blog.image1 && (
          <img 
            src={blog.image1} 
            alt={blog.title}
            style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '2rem' }}
          />
        )}
        
        <div style={{ fontSize: '1.125rem', lineHeight: '1.8', color: '#374151', marginBottom: '2rem' }}>
          <p>{blog.content}</p>
        </div>
        
        {blog.heading1 && (
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
            {blog.heading1}
          </h2>
        )}
        
        {blog.description1 && (
          <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#4b5563', marginBottom: '2rem' }}>
            {blog.description1}
          </p>
        )}
        
        {blog.heading2 && (
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
            {blog.heading2}
          </h2>
        )}
        
        {blog.description2 && (
          <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#4b5563', marginBottom: '2rem' }}>
            {blog.description2}
          </p>
        )}
        
        {blog.image2 && (
          <img 
            src={blog.image2} 
            alt={blog.title}
            style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '2rem' }}
          />
        )}
        
        <div style={{ marginTop: '3rem' }}>
          <a 
            href={`/blogs/${blog.slug || blog.id}`}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            ← Back to Blogs
          </a>
        </div>
      </div>
    </div>
  );
}