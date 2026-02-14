"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
// import { db } from '../../firebase12';
import { blogDb } from '../../../firebaseConfig';
import Headers from "../../../components/layout/header/Header";
import PageHeader from "../../../components/layout/PageHeader";
import Footer from "../../../components/layout/footer/Footer";
import CustomCursor from "../../../components/layout/CustomCursor";
import { FaCalendarAlt, FaUser, FaArrowRight, FaClock, FaHome } from 'react-icons/fa';
import facebook from "../../../public/assets/images/blogs/facebook.png";
import linkedin from "../../../public/assets/images/blogs/linkedin.png"; 
import twitter from "../../../public/assets/images/blogs/twitter.png";
import Image from "next/image";

function BlogDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkMap, setLinkMap] = useState({
    'Tech Cloud ERP': 'https://techclouderp.com',
    'ERP': 'https://techclouderp.com/erp',
    'inventory management': 'https://techclouderp.com/inventory-management',
    'billing software': 'https://techclouderp.com/billing-software',
    'accounting': 'https://techclouderp.com/accounting-software'
  });

  // Function to convert specific words to links
  const addLinksToText = (text) => {
    if (!text) return text;
    
    let processedText = text;
    
    // Replace each word with its link
    Object.entries(linkMap).forEach(([word, link]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      processedText = processedText.replace(regex, `<a href="${link}" target="_blank" style="color: #3b82f6; text-decoration: underline; font-weight: 500;">${word}</a>`);
    });
    
    return processedText;
  };

  // Function to add new link dynamically
  const addNewLink = (word, url) => {
    setLinkMap(prev => ({
      ...prev,
      [word]: url
    }));
  };

  // Function to remove link dynamically
  const removeLink = (word) => {
    setLinkMap(prev => {
      const newMap = { ...prev };
      delete newMap[word];
      return newMap;
    });
  };

  // Function to update existing link
  const updateLink = (word, url) => {
    setLinkMap(prev => ({
      ...prev,
      [word]: url
    }));
  };

  // Function to apply anchor tags from blog data
  const applyAnchorTags = (text, anchorTags) => {
    if (!text || !anchorTags) return text;
    
    let processedText = text;
    
    // Apply each anchor tag
    Object.entries(anchorTags).forEach(([key, tag]) => {
      if (tag.word && tag.url) {
        const regex = new RegExp(`\\b${tag.word}\\b`, 'gi');
        processedText = processedText.replace(regex, `<a href="${tag.url}" target="_blank" style="color: #3b82f6; text-decoration: underline; font-weight: 500;">${tag.word}</a>`);
      }
    });
    
    return processedText;
  };

  const breadcrumbs = [
    { label: 'Home', link: '/', icon: FaHome },
    { label: 'Blogs', link: '/blogs' },
    { label: 'Blog Detail', link: null }
  ];

  // Format Date
  const formatDate = (createdAt) => {
    if (!createdAt) return "No date";

    if (typeof createdAt.toDate === "function") {
      return new Date(createdAt.toDate()).toLocaleDateString();
    } else if (typeof createdAt === "string") {
      return new Date(createdAt).toLocaleDateString();
    } else if (createdAt instanceof Date) {
      return createdAt.toLocaleDateString();
    }

    return "Invalid date";
  };

  // Calculate reading time
  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const text = content || '';
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  // Highlight keyword in text
  const highlightKeyword = (text, keyword) => {
    if (!keyword || !text) return text;
    
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<span style="background-color: #ffeb3b; font-weight: 600; padding: 2px 4px; border-radius: 3px;">$1</span>');
  };

  useEffect(() => {
    const fetchBlog = async () => {
      const slug = searchParams.get('slug');
      
      if (!slug) {
        setLoading(false);
        return;
      }
      
      try {
        // Try by slug first
        const blogQuery = query(
          // collection(db, "blog"),
          collection(blogDb, "blog"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(blogQuery);
        
        if (!querySnapshot.empty) {
          const blogData = {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data()
          };
          setBlog(blogData);
          
          // Fetch related blogs (excluding current blog)
          const allBlogsQuery = await getDocs(collection(blogDb, "blog"));
          const allBlogs = allBlogsQuery.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(b => b.id !== blogData.id)
            .slice(0, 3); // Get 3 related blogs
          setRelatedBlogs(allBlogs);
        } else {
          // Try by document ID
          // const docRef = doc(db, "blog", slug);
          const docRef = doc(blogDb, "blog", slug); 
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const blogData = {
              id: docSnap.id,
              ...docSnap.data()
            };
            setBlog(blogData);
            
            // Fetch related blogs
            const allBlogsQuery = await getDocs(collection(blogDb, "blog"));
            const allBlogs = allBlogsQuery.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(b => b.id !== blogData.id)
              .slice(0, 3);
            setRelatedBlogs(allBlogs);
          }
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        console.error("Error details:", error.message);
        console.error("Error code:", error.code);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [searchParams]);

  if (loading) {
    return (
      <div>
        <Headers />
        <PageHeader title="Blog Detail" breadcrumbs={breadcrumbs} />
 
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
        
      </div>
    );
  }

  if (!blog) {
    return (
      <div>
        <Headers />
        <PageHeader title="Blog Detail" breadcrumbs={breadcrumbs} />
        
        <div style={{ minHeight: '60vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1>Blog Post Not Found</h1>
            <button 
              onClick={() => router.push('/blogs/')}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ← Back to Blogs
            </button>
          </div>
        </div>
        <Footer />
         
      </div>
    );
  }

  return (
    
    <div >
      <Headers />
      <PageHeader title="Blog Detail" breadcrumbs={breadcrumbs} />
      <CustomCursor />
      <style jsx>{` 
        .hero {
             background: transparent;
            -webkit-border-radius: 1.5rem;
            -moz-border-radius: 1.5rem;
            border-radius: 1.5rem;
            margin-bottom: 3rem;
            text-align: center;
            color: #ff5834;
            position: relative;
            overflow: hidden;
            -webkit-box-shadow: 0 25px 50px -12px rgba(0, 0, 0, .25);
            -moz-box-shadow: 0 25px 50px -12px rgba(0,0,0,.25);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, .25);
        }
        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          z-index: 1;
        }
        .hero::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
           z-index: 1;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        
        .hero-title{
        font-family: Inter;
        font-weight: 700;
        font-style: Bold;
        font-size: 24px;
        leading-trim: NONE;
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: middle; 
        } 
        .img-fluid{
          width: 100%;
          height: 450px;
          object-fit: cover;
        }
        .section-card {
          background: white;
          border-radius: 1.5rem;
          padding: 3rem;
          border: 1px solid rgba(226, 232, 240, 0.5);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .section-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }
        .section-card:hover::before {
          transform: scaleX(1);
        }
        .section-card:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .section-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .block-heading{
        font-family: Inter;
        font-weight: 600;
        font-style: Semi Bold;
        font-size: 20px; 
        line-height: 100%;
        letter-spacing: 0%;
        vertical-align: middle;
        color: #000000;
        margin-bottom:10px; 
        margin-top:10px;
        }
        .section-title {
           
          font-weight: 700;
          font-style: 500;
          font-size: 25px; 
          line-height: 100%;
          letter-spacing: 0%;
          vertical-align: middle;
          color: #D94B23;
          margin-bottom:10px;
          word-spacing: 1px;
          letter-spacing: 0.2px;
        }
        .section-description {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #475569;
          
          white-space: pre-wrap;
          
          margin-bottom:0px;
        }
        .content-section{
          margin-bottom:20px;
        }
        .content-sectiontwo{
          color:#047791; 
          font-weight: 600;
          font-style: Semi Bold;
          font-size: 25px;
          leading-trim: NONE;
          line-height: 100%;
          letter-spacing: 0%;
          vertical-align: middle; 
        }
        .section-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .challenge-item {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-left: 4px solid #3b82f6;
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
          .toc-card{ 
            width: 390px;
            height: auto;
            opacity: 1;
            gap: 15px;
            border-radius: 20px;
            border-width: 2px;
            padding-top: 25px;
            padding-right: 10px;
            padding-bottom: 10px;
            padding-left: 25px;
            border: 2px solid #F8AF9B;
            box-shadow: 0px 0px 15px 0px #EF522633;
            box-shadow: 0px 0px 15px 0px #EF522626 inset;
          }
         .toc-title{
          border-bottom: 3px solid #F48B6E;
          width: 75%;
          }
         .toc-list{
            padding:5px;
            margin:10px 0px;
             color:#000000;
             list-style: none;
         } 
         .toc-list a{
             color: #000000;
             text-decoration: none;
             font-weight: 500;
             font-size:16px;
         }
         .toc-list a:hover{
             text-decoration: underline;
         } 
             .share-section{
                 display: flex;
                  margin: 10px 0px;
                  flex-direction: row;
                  align-content: center;
                  align-items: center;
                  gap:10px;
             }

             .share-title{
             font-family: Inter;
            font-weight: 500;
            font-style: Medium;
            font-size: 14px;
            leading-trim: NONE;
            line-height: 100%;
            letter-spacing: 0%;
            }
            .share-icons{
            display:flex;
            gap:10px;
            }
            .share-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
              border: 2px solid #e5e7eb;
              border-radius: 50%;
              text-decoration: none;
              transition: all 0.2s ease;
            }
            .share-icon:hover {
              border-color: #3b82f6;
              transform: scale(1.1);
            }
       .author-content {
        width: 390px;
         }

         .author-info{
          display: flex;
          align-items: center;
          gap: 1rem;
          padding:2px;
           border-radius: 20px;
            border-width: 2px;
            padding-top: 25px; 
         }
         .author-info-img{
         width:100%;
         height:100%;
         }
        .challenge-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .challenge-item:hover::before {
          opacity: 1;
        }
        .challenge-item:hover {
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.15);
          transform: translateX(8px);
        }
        .challenge-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }
        .challenge-text {
          color: #475569;
          line-height: 1.7;
          font-size: 1rem;
        }
        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          position: relative;
        }
        .benefit-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .benefit-item:hover::before {
          opacity: 1;
        }
        .benefit-item:hover {
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.15);
          transform: translateY(-4px);
        }
        .benefit-number {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 1.25rem;
          flex-shrink: 0;
          box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
        }
        .benefit-content {
          flex: 1;
        }
        .benefit-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }
        .benefit-text {
          color: #475569;
          line-height: 1.7;
          font-size: 1rem;
        }
         
        
        .faq-header {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
          z-index: 2;
        }
        .faq-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
         
        .faq-grid {
          display: grid;
          gap: 1.5rem;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
       
        .faq-question { 
          margin-top:10px;
          font-weight: 700; 
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.125rem;
        }
        .faq-answer {
         
          color: #475569;
          line-height: 1.7;
           font-size: 1rem;
        }
        .related-section {
          margin-top: 4rem;
          padding-top: 4rem;
          border-top: 2px solid rgba(226, 232, 240, 0.5);
        }
        .related-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 3rem;
          text-align: center;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }
        .related-card {
          background: white;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
        }
        .related-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }
        .related-card:hover::before {
          transform: scaleX(1);
        }
        .related-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        .related-image {
          width: 100%;
          height: 250px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .related-placeholder {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
          border-radius: 1rem;
        }
        .related-content {
          padding: 2rem;
        }
        .related-title-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.4;
          margin-bottom: 1rem;
        }
        .related-date {
          font-size: 0.875rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          padding: 1rem 2rem;
          border-radius: 1rem;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s ease;
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
        }
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
          .tcerp_indicaa_new{
          position: fixed; 
          }
          .fixedbar{
              position: sticky;
              top: 100px;
          }
        @media (max-width: 768px) {
         
          .blog-hero {
            padding: 2rem 1.5rem;
            margin-bottom: 2rem;
          }
          
          .blog-hero-meta {
            flex-direction: column;
            gap: 0.75rem;
            align-items: center;
          }
          .section-card {
            padding: 2rem;
            margin-bottom: 1.5rem;
          }
          .section-title {
            font-size: 1.5rem;
          }
          .faq-section {
            padding: 2rem 1.5rem;
            margin: 2rem 0;
          }
          .faq-title {
            font-size: 2rem;
          }
          .related-grid {
            grid-template-columns: 1fr;
          }
          .challenge-item, .benefit-item {
            padding: 1.5rem;
          }
          .img-fluid{ 
            height: auto; 
          }
            .author-content {
        width: 390px;
         }
        }
        .link-manager-section {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(226, 232, 240, 0.5);
          margin-bottom: 1.5rem;
        }
        .link-manager-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }
        .link-list {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 1rem;
        }
        .link-item {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .link-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }
        .link-word {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.875rem;
        }
        .link-url {
          color: #64748b;
          font-size: 0.75rem;
          word-break: break-all;
        }
        .link-actions {
          display: flex;
          gap: 0.5rem;
        }
        .link-edit-btn, .link-remove-btn {
          padding: 0.25rem 0.5rem;
          border: none;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .link-edit-btn {
          background: #3b82f6;
          color: white;
        }
        .link-edit-btn:hover {
          background: #2563eb;
        }
        .link-remove-btn {
          background: #ef4444;
          color: white;
        }
        .link-remove-btn:hover {
          background: #dc2626;
        }
        .add-link-btn {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .add-link-btn:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
        }
      `}</style>
      <div className='container'>
      <div className="blog-layout row">
        {/* Left Column - Main Content */}
        <div className="main-content col-md-8">
          {/* Hero Section */}
          <div className="hero">
            {blog.brocher?.imageUrl ? (
              <img src={blog.brocher.imageUrl} alt={blog.title} className="img-fluid" />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}></div>
            )}
            <div className="hero-overlay"></div>
            {/* <h1 className="hero-title">{blog.title}</h1> */}
          </div>

          {/* Main Heading + Intro */}
          {blog.contentSection && Object.keys(blog.contentSection).map((sectionKey) => {
            const section = blog.contentSection[sectionKey];
            return (
              <div key={sectionKey} className="content-section" id={`content-section-${sectionKey}`}>
                <h2 className="section-title">{section.title}</h2>
                {section.description && Object.keys(section.description).map((descKey) => (
                  <p key={descKey} className="section-description" dangerouslySetInnerHTML={{ __html: applyAnchorTags(section.description[descKey], blog.anchorTags) }}></p>
                ))}
              </div>
            );
          })}

          {/* Challenges Section */}
          {blog.contentSection2 && blog.contentSection2['1'] && (
            <div className="content-section" id="content-section2-1">
              <h2 className="section-title content-sectiontwo">{blog.contentSection2['1'].title}</h2>
              <p className="section-description" dangerouslySetInnerHTML={{ 
                    __html: applyAnchorTags(blog.contentSection2['1'].shortDescription, blog.anchorTags) 
                  }}></p>
              {blog.contentSection2['1'].description && Object.keys(blog.contentSection2['1'].description).map((itemKey) => {
                const item = blog.contentSection2['1'].description[itemKey];
                return (
                  <div key={itemKey} className="challenge-block">
                    <h3 className="block-heading">{item.heading}</h3>
                    <p className="block-text" dangerouslySetInnerHTML={{ 
                    __html: applyAnchorTags(item.text, blog.anchorTags) 
                  }}></p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Transform Section */}
          {blog.contentSection2 && blog.contentSection2['2'] && (
            <div className="content-section" id="content-section2-2">
              <h2 className="section-title content-sectiontwo">{blog.contentSection2['2'].title}</h2>
              <p className="section-description" dangerouslySetInnerHTML={{ 
                    __html: applyAnchorTags(blog.contentSection2['2'].shortDescription, blog.anchorTags) 
                  }}></p>
              {blog.contentSection2['2'].description && Object.keys(blog.contentSection2['2'].description).map((itemKey) => {
                const item = blog.contentSection2['2'].description[itemKey];
                return (
                  <div key={itemKey} className="transform-block">
                    <h3 className="block-heading">{item.heading}</h3>
                    <p className="block-text" dangerouslySetInnerHTML={{ 
                    __html: applyAnchorTags(item.text, blog.anchorTags) 
                  }}></p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Benefits Section */}
          {blog.contentSection2 && blog.contentSection2['3'] && (
            <div className="content-section" id="content-section2-3">
              <h2 className="section-title">{blog.contentSection2['3'].title}</h2>
              <p className="section-description" dangerouslySetInnerHTML={{ 
                    __html: applyAnchorTags(blog.contentSection2['3'].shortDescription, blog.anchorTags) 
                  }}></p>
              {blog.contentSection2['3'].description && Object.keys(blog.contentSection2['3'].description).map((itemKey) => {
                const item = blog.contentSection2['3'].description[itemKey];
                return (
                  <div key={itemKey} className="benefit-block">
                    <h3 className="block-heading">{item.heading}</h3>
                    <p className="block-text" dangerouslySetInnerHTML={{ 
                    __html: applyAnchorTags(item.text, blog.anchorTags) 
                  }}></p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Conclusion */}
          {blog.Conclusion && (
            <div className="conclusion" id="conclusion">
              <h3 className='section-title'>Conclusion</h3>
              <p dangerouslySetInnerHTML={{ 
                    __html: applyAnchorTags(blog.Conclusion, blog.anchorTags) 
                  }}></p>
            </div>
          )}

          {/* FAQ Section */}
          {blog.faqSection && (
            <div className="faq-section" id="faq-section">
              <h2 className="section-title">{blog.faqSection.title}</h2>
              {/* {blog.faqSection.description && (
                <p className="section-description">{blog.faqSection.description}</p>
              )} */}
              {blog.faqSection.faqs && Object.keys(blog.faqSection.faqs).map((faqKey) => {
                const faq = blog.faqSection.faqs[faqKey];
                return (
                  <div key={faqKey} className="faq-item">
                    <div className="faq-question">
                      {faq.question}
                     
                    </div>
                    <div className="faq-answer" dangerouslySetInnerHTML={{ 
                    __html: applyAnchorTags(faq.answer, blog.anchorTags) 
                  }}></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="sidebar col-md-4">
           <div className="fixedbar">
          {/* Table of Contents */}
          <div className="toc-card">
            <h3 className="toc-title">Table of Contents</h3>
            <ol className="toc-list">
              {blog.contentSection && Object.keys(blog.contentSection).map((sectionKey) => (
                <li key={sectionKey}>
                  <a href={`#content-section-${sectionKey}`}>{blog.contentSection[sectionKey].title}</a>
                </li>
              ))}
              {blog.contentSection2 && blog.contentSection2['1'] && (
                <li>
                  <a href={`#content-section2-1`}>{blog.contentSection2['1'].title}</a>
                </li>
              )}
              {blog.contentSection2 && blog.contentSection2['2'] && (
                <li>
                  <a href={`#content-section2-2`}>{blog.contentSection2['2'].title}</a>
                </li>
              )}
              {blog.contentSection2 && blog.contentSection2['3'] && (
                <li>
                  <a href={`#content-section2-3`}>{blog.contentSection2['3'].title}</a>
                </li>
              )}
              {blog.Conclusion && (
                <li>
                  <a href="#conclusion">Conclusion</a>
                </li>
              )}
              {blog.faqSection && (
                <li>
                  <a href="#faq-section">FAQ</a>
                </li>
              )}
            </ol>
          </div>

          {/* Author Card */}
          <div className="author-card">
            <div className="author-content">
              
              <div className="author-info">
                <img 
                  src="https://res.cloudinary.com/techclouderp/image/upload/v1770289281/blogimg_mhjwse.png" 
                  alt="Author" 
                  className='author-info-img'
                  
                />
              </div>
            </div>
          </div>

          {/* Share Icons */}
          <div className="share-section">
            <h3 className="share-title">Follow Us</h3>
            <div className="share-icons">
              <a 
                href="https://www.facebook.com/TechCloudERPSoftwareSolutions"
                target="_blank"
                rel="noopener noreferrer"
                className="share-icon"
              >
                <Image
                  src={facebook}
                  alt="Follow on Facebook"
                  width={8}
                  height={8}
                />
              </a>
              <a 
                href="https://www.linkedin.com/company/tech-cloud-erp/"
                target="_blank"
                rel="noopener noreferrer"
                className="share-icon"
              >
                <Image
                  src={linkedin}
                  alt="Follow on LinkedIn"
                  width={12}
                  height={12}
                />
              </a>
              <a 
                href="https://x.com/TechCloudERP"
                target="_blank"
                rel="noopener noreferrer"
                className="share-icon"
              >
                <Image
                  src={twitter}
                  alt="Follow on X"
                  width={12}
                  height={12}
                />
              </a>
            </div>
          </div>

          {/* Dynamic Link Manager */}
          
          </div>
        </div>
      </div>
      </div>

      <Footer />
      <CustomCursor />
    </div>
  );
}

export default function BlogDetail() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <BlogDetailContent />
    </Suspense>
  );
}