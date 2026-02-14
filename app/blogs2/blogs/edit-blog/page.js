"use client";

import { useState, useEffect, Suspense } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { blogDb } from "../../../../firebaseConfig";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../../../components/layout/header/Header";
import PageHeader from "../../../../components/layout/PageHeader";
import Footer from "../../../../components/layout/footer/Footer";
import CustomCursor from "../../../../components/layout/CustomCursor";
import { FaHome } from 'react-icons/fa';

function EditBlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get('id');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [brocherText, setBrocherText] = useState("");
  const [brocherImage, setBrocherImage] = useState("");
  const [Conclusion, setConclusion] = useState("");
  
  // Content sections
  const [contentSection, setContentSection] = useState({});
  const [contentSection2, setContentSection2] = useState({});
  
  // FAQ section
  const [faqTitle, setFaqTitle] = useState("");
  const [faqDescription, setFaqDescription] = useState("");
  const [faqs, setFaqs] = useState({});

  const breadcrumbs = [
    { label: 'Home', link: '/', icon: FaHome },
    { label: 'Blogs', link: '/blogs' },
    { label: 'Blog List', link: '/blogs/blogs/blog-list' },
    { label: 'Edit Blog', link: null }
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchBlog = async () => {
      if (!blogId) {
        if (isMounted) {
          setError("Blog ID not provided");
          setLoading(false);
        }
        return;
      }

      try {
        const docRef = doc(blogDb, "blog", blogId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const blogData = docSnap.data();
          if (isMounted) {
            setTitle(blogData.title || "");
            setSlug(blogData.slug || "");
            setBrocherText(blogData.brocher?.text || "");
            setBrocherImage(blogData.brocher?.imageUrl || "");
            setConclusion(blogData.Conclusion || "");
            setContentSection(blogData.contentSection || {});
            setContentSection2(blogData.contentSection2 || {});
            setFaqTitle(blogData.faqSection?.title || "");
            setFaqDescription(blogData.faqSection?.description || "");
            setFaqs(blogData.faqSection?.faqs || {});
            setError(null);
          }
        } else {
          if (isMounted) {
            setError("Blog not found");
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching blog:", error);
          setError("Failed to load blog data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlog();
    
    return () => {
      isMounted = false;
    };
  }, [blogId]);

  const createSlug = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, "-");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blogId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const blogRef = doc(blogDb, "blog", blogId);
      await updateDoc(blogRef, {
        title,
        slug: slug || createSlug(title),
        brocher: {
          text: brocherText,
          imageUrl: brocherImage,
        },
        Conclusion,
        contentSection,
        contentSection2,
        faqSection: {
          title: faqTitle,
          description: faqDescription,
          faqs,
        },
        updatedAt: new Date(),
      });

      router.push("/blogs/blogs/blog-list");
    } catch (error) {
      console.error("Error updating blog:", error);
      setError("Failed to update blog. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header/>
        <PageHeader title="Edit Blog" breadcrumbs={breadcrumbs}/>
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
            <p>Loading blog data...</p>
          </div>
        </div>
        <Footer/>
        <CustomCursor/>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header/>
        <PageHeader title="Edit Blog" breadcrumbs={breadcrumbs}/>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '0.5rem', 
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error</h3>
              <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>{error}</p>
              <Link
                href="/blogs/blogs/blog-list"
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'inline-block'
                }}
              >
                ← Back to Blog List
              </Link>
            </div>
          </div>
        </div>
        <Footer/>
        <CustomCursor/>
      </>
    );
  }

  return (
    <>
      <Header/>
      <PageHeader title="Edit Blog" breadcrumbs={breadcrumbs}/>
      
      <div style={{ minHeight: '60vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link
            href="/blogs/blogs/blog-list"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#2563eb',
              textDecoration: 'none',
              marginBottom: '2rem',
              fontWeight: '500'
            }}
          >
            ← Back to Blog List
          </Link>

          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
            padding: '2rem' 
          }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
              Edit Blog Post
            </h1>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.375rem',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: '#dc2626'
              }}>
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {/* Basic Information Section */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '1rem', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '12px', height: '12px', backgroundColor: '#ff6b00', borderRadius: '50%' }}></span>
                  Basic Information
                </h2>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                      Blog Title <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter an engaging title for your blog post"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setSlug(createSlug(e.target.value));
                      }}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                      URL Slug
                    </label>
                    <input
                      type="text"
                      placeholder="url-friendly-blog-title"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white',
                        color: '#6b7280'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Auto-generated from title. Used in URL.
                    </p>
                  </div>
                </div>
              </div>

              {/* Brochure Section */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                  Brochure Section
                </h2>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                      Brochure Text
                    </label>
                    <textarea
                      placeholder="A compelling summary that highlights key points of your blog post"
                      value={brocherText}
                      onChange={(e) => setBrocherText(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                      Brochure Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={brocherImage}
                      onChange={(e) => setBrocherImage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#8b5cf6', borderRadius: '50%' }}></span>
                  Content Section
                </h2>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                      Section Title
                    </label>
                    <input
                      type="text"
                      placeholder="Section 0 Title"
                      value={contentSection['0']?.title || ''}
                      onChange={(e) => setContentSection(prev => ({
                        ...prev,
                        '0': { ...prev['0'], title: e.target.value }
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                      Section Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="Section 0 Image URL"
                      value={contentSection['0']?.imgurl2 || ''}
                      onChange={(e) => setContentSection(prev => ({
                        ...prev,
                        '0': { ...prev['0'], imgurl2: e.target.value }
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                        Section Descriptions
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentDescriptions = contentSection['0']?.description || {};
                          const nextKey = Object.keys(currentDescriptions).length;
                          setContentSection(prev => ({
                            ...prev,
                            '0': { 
                              ...prev['0'], 
                              description: { 
                                ...currentDescriptions, 
                                [nextKey]: '' 
                              }
                            }
                          }));
                        }}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                      >
                        + Add Description
                      </button>
                    </div>
                    {Object.keys(contentSection['0']?.description || {}).map((descKey) => (
                      <div key={descKey} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <textarea
                          placeholder={`Description ${parseInt(descKey) + 1}`}
                          value={contentSection['0']?.description?.[descKey] || ''}
                          onChange={(e) => setContentSection(prev => ({
                            ...prev,
                            '0': { 
                              ...prev['0'], 
                              description: { 
                                ...prev['0']?.description, 
                                [descKey]: e.target.value 
                              }
                            }
                          }))}
                          rows={3}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'white'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newDescriptions = { ...contentSection['0']?.description };
                            delete newDescriptions[descKey];
                            // Renumber remaining descriptions
                            const renumberedDescriptions = {};
                            Object.keys(newDescriptions).forEach((key, index) => {
                              renumberedDescriptions[index] = newDescriptions[key];
                            });
                            setContentSection(prev => ({
                              ...prev,
                              '0': { 
                                ...prev['0'], 
                                description: renumberedDescriptions 
                              }
                            }));
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Section 2 */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#ec4899', borderRadius: '50%' }}></span>
                  Content Section 2
                </h2>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                    Sections
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextKey = Object.keys(contentSection2).length + 1;
                      setContentSection2(prev => ({
                        ...prev,
                        [nextKey]: {
                          title: '',
                          shortDescription: '',
                          imgurl2: '',
                          description: {}
                        }
                      }));
                    }}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    + Add Section
                  </button>
                </div>
                
                {Object.keys(contentSection2).map((sectionKey) => (
                  <div key={sectionKey} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                        Section {sectionKey}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newSections = { ...contentSection2 };
                          delete newSections[sectionKey];
                          // Renumber remaining sections
                          const renumberedSections = {};
                          Object.keys(newSections).forEach((key, index) => {
                            const newKey = (index + 1).toString();
                            renumberedSections[newKey] = newSections[key];
                          });
                          setContentSection2(renumberedSections);
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                      >
                        Remove Section
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                          Section Title
                        </label>
                        <input
                          type="text"
                          placeholder={`Section ${sectionKey} Title`}
                          value={contentSection2[sectionKey]?.title || ''}
                          onChange={(e) => setContentSection2(prev => ({
                            ...prev,
                            [sectionKey]: { ...prev[sectionKey], title: e.target.value }
                          }))}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'white'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                          Short Description
                        </label>
                        <textarea
                          placeholder={`Section ${sectionKey} Short Description`}
                          value={contentSection2[sectionKey]?.shortDescription || ''}
                          onChange={(e) => setContentSection2(prev => ({
                            ...prev,
                            [sectionKey]: { ...prev[sectionKey], shortDescription: e.target.value }
                          }))}
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'white',
                            resize: 'vertical'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                          Image URL
                        </label>
                        <input
                          type="url"
                          placeholder={`Section ${sectionKey} Image URL`}
                          value={contentSection2[sectionKey]?.imgurl2 || ''}
                          onChange={(e) => setContentSection2(prev => ({
                            ...prev,
                            [sectionKey]: { ...prev[sectionKey], imgurl2: e.target.value }
                          }))}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'white'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <label style={{ display: 'block', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                            Section Items
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const currentItems = contentSection2[sectionKey]?.description || {};
                              const nextItemKey = Object.keys(currentItems).length + 1;
                              setContentSection2(prev => ({
                                ...prev,
                                [sectionKey]: { 
                                  ...prev[sectionKey], 
                                  description: { 
                                    ...currentItems, 
                                    [nextItemKey]: { heading: '', text: '' }
                                  }
                                }
                              }));
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                          >
                            + Add Item
                          </button>
                        </div>
                        {Object.keys(contentSection2[sectionKey]?.description || {}).map((itemKey) => (
                          <div key={itemKey} style={{ border: '1px solid #f3f4f6', borderRadius: '0.375rem', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <label style={{ display: 'block', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                                Item {itemKey}
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = { ...contentSection2[sectionKey]?.description };
                                  delete newItems[itemKey];
                                  // Renumber remaining items
                                  const renumberedItems = {};
                                  Object.keys(newItems).forEach((key, index) => {
                                    const newKey = (index + 1).toString();
                                    renumberedItems[newKey] = newItems[key];
                                  });
                                  setContentSection2(prev => ({
                                    ...prev,
                                    [sectionKey]: { 
                                      ...prev[sectionKey], 
                                      description: renumberedItems 
                                    }
                                  }));
                                }}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                              >
                                Remove
                              </button>
                            </div>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              <input
                                type="text"
                                placeholder={`Item ${itemKey} Heading`}
                                value={contentSection2[sectionKey]?.description?.[itemKey]?.heading || ''}
                                onChange={(e) => setContentSection2(prev => ({
                                  ...prev,
                                  [sectionKey]: { 
                                    ...prev[sectionKey], 
                                    description: { 
                                      ...prev[sectionKey]?.description, 
                                      [itemKey]: { 
                                        ...prev[sectionKey]?.description?.[itemKey], 
                                        heading: e.target.value 
                                      }
                                    }
                                  }
                                }))}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem 0.75rem',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  transition: 'all 0.2s ease',
                                  backgroundColor: 'white'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                              <textarea
                                placeholder={`Item ${itemKey} Text`}
                                value={contentSection2[sectionKey]?.description?.[itemKey]?.text || ''}
                                onChange={(e) => setContentSection2(prev => ({
                                  ...prev,
                                  [sectionKey]: { 
                                    ...prev[sectionKey], 
                                    description: { 
                                      ...prev[sectionKey]?.description, 
                                      [itemKey]: { 
                                        ...prev[sectionKey]?.description?.[itemKey], 
                                        text: e.target.value 
                                      }
                                    }
                                  }
                                }))}
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem 0.75rem',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  transition: 'all 0.2s ease',
                                  backgroundColor: 'white',
                                  resize: 'vertical'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Section */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></span>
                  FAQ Section
                </h2>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                      FAQ Title
                    </label>
                    <input
                      type="text"
                      placeholder="Frequently Asked Questions"
                      value={faqTitle}
                      onChange={(e) => setFaqTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                      FAQ Description
                    </label>
                    <textarea
                      placeholder="Find answers to common questions about this topic"
                      value={faqDescription}
                      onChange={(e) => setFaqDescription(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'white',
                        resize: 'vertical'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                      FAQs
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newFaq = {
                          question: `Question ${Object.keys(faqs).length + 1}`,
                          answer: 'Answer placeholder'
                        };
                        setFaqs(prev => ({
                          ...prev,
                          [Object.keys(faqs).length + 1]: newFaq
                        }));
                      }}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      + Add FAQ
                    </button>
                  </div>
                  {Object.keys(faqs).map((faqKey) => (
                    <div key={faqKey} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', backgroundColor: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                          FAQ {faqKey}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            const newFaqs = { ...faqs };
                            delete newFaqs[faqKey];
                            // Renumber remaining FAQs
                            const renumberedFaqs = {};
                            Object.keys(newFaqs).forEach((key, index) => {
                              const newKey = index < parseInt(faqKey) ? (index + 1).toString() : index.toString();
                              renumberedFaqs[newKey] = newFaqs[key];
                            });
                            setFaqs(renumberedFaqs);
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                        >
                          Remove
                        </button>
                      </div>
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                            Question
                          </label>
                          <input
                            type="text"
                            placeholder={`Question ${parseInt(faqKey) + 1}`}
                            value={faqs[faqKey]?.question || ''}
                            onChange={(e) => setFaqs(prev => ({
                              ...prev,
                              [faqKey]: { ...prev[faqKey], question: e.target.value }
                            }))}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                            Answer
                          </label>
                          <textarea
                            placeholder={`Answer ${parseInt(faqKey) + 1}`}
                            value={faqs[faqKey]?.answer || ''}
                            onChange={(e) => setFaqs(prev => ({
                              ...prev,
                              [faqKey]: { ...prev[faqKey], answer: e.target.value }
                            }))}
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'white',
                              resize: 'vertical'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion Section */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#06b6d4', borderRadius: '50%' }}></span>
                  Conclusion
                </h2>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                    Conclusion Text
                  </label>
                  <textarea
                    placeholder="Summarize the key takeaways and final thoughts"
                    value={Conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <Link
                  href="/blogs/blogs/blog-list"
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#6b7280',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                >
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.75rem 2rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  {isSubmitting && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  )}
                  {isSubmitting ? 'Updating Blog...' : 'Update Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer/>
      <CustomCursor/>
    </>
  );
}

export default function EditBlog() {
  return (
    <Suspense fallback={
      <>
        <Header/>
        <PageHeader title="Edit Blog" breadcrumbs={[]}/>
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
        <Footer/>
        <CustomCursor/>
      </>
    }>
      <EditBlogContent />
    </Suspense>
  );
}