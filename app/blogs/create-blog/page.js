"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase12";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateBlog() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [heading1, setHeading1] = useState("");
  const [heading2, setHeading2] = useState("");
  const [description1, setDescription1] = useState("");
  const [description2, setDescription2] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");

  const createSlug = (text) =>
    text.toLowerCase().trim().replace(/\s+/g, "-");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "blog"), {
        title,
        content,
        heading1,
        heading2,
        description1,
        description2,
        image1,
        image2,
        slug: createSlug(title),
        createdAt: serverTimestamp(),
      });

      router.push("/");
    } catch (error) {
      console.error("Error creating blog:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          ← Back to Blogs
        </Link>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">
            Create New Blog Post
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-lg p-8 space-y-6"
          >
            {/* Title */}
            <input
              type="text"
              placeholder="Blog Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-md"
            />

            {/* Main Content */}
            <textarea
              placeholder="Main Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              className="w-full px-4 py-3 border rounded-md"
            />

            {/* Heading 1 */}
            <input
              type="text"
              placeholder="Heading 1"
              value={heading1}
              onChange={(e) => setHeading1(e.target.value)}
              className="w-full px-4 py-3 border rounded-md"
            />

            {/* Description 1 */}
            <textarea
              placeholder="Description 1"
              value={description1}
              onChange={(e) => setDescription1(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border rounded-md"
            />

            {/* Heading 2 */}
            <input
              type="text"
              placeholder="Heading 2"
              value={heading2}
              onChange={(e) => setHeading2(e.target.value)}
              className="w-full px-4 py-3 border rounded-md"
            />

            {/* Description 2 */}
            <textarea
              placeholder="Description 2"
              value={description2}
              onChange={(e) => setDescription2(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border rounded-md"
            />

            {/* Image 1 URL */}
            <input
              type="url"
              placeholder="Image 1 URL"
              value={image1}
              onChange={(e) => setImage1(e.target.value)}
              className="w-full px-4 py-3 border rounded-md"
            />

            {/* Image 2 URL */}
            <input
              type="url"
              placeholder="Image 2 URL"
              value={image2}
              onChange={(e) => setImage2(e.target.value)}
              className="w-full px-4 py-3 border rounded-md"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Creating..." : "Create Blog Post"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
