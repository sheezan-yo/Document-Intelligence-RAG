/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import Link from "next/link";

export default function UploadPage() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  const upload = async (e: any) => {
    const files = Array.from(e.target.files);

    for (const file of files as File[]) {
      setUploads((prev) => [
        ...prev,
        {
          name: file.name,
          status: "Uploading...",
        },
      ]);

      const form = new FormData();
      form.append("file", file);

      try {
        await axios.post("http://localhost:8000/upload", form);

        const interval = setInterval(async () => {
          const res = await axios.get(
            `http://localhost:8000/status/${file.name}`,
          );

          setUploads((prev) =>
            prev.map((item) =>
              item.name === file.name
                ? {
                    ...item,
                    status: res.data.status,
                  }
                : item,
            ),
          );

          if (res.data.status === "Completed") {
            clearInterval(interval);
            loadDocuments();
          }
        }, 1000);
      } catch (err: any) {
        setUploads((prev) =>
          prev.map((item) =>
            item.name === file.name
              ? {
                  ...item,
                  status: err.response?.data?.detail || "Failed ❌",
                }
              : item,
          ),
        );
      }
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:8000/documents");

      setDocuments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteDocument = async (filename: string) => {
    try {
      await axios.delete(
        `http://localhost:8000/documents/${encodeURIComponent(filename)}`,
      );

      setDocuments((prev) => prev.filter((doc) => doc.filename != filename));
    } catch (error) {
      console.error("Deletion Failed:", error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bulk Upload</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Upload documents to your knowledge base.
            </p>
          </div>

          <Link
            href="/"
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg transition"
          >
            Go to Chat
          </Link>
        </div>
        {/* Upload Area */}
        <label className="border-2 border-dashed border-zinc-700 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 transition">
          <FiUploadCloud size={48} />
          <p className="mt-4 text-lg">Choose Documents</p>

          <p className="text-sm text-zinc-500 mt-2">PDF, TXT, PNG, JPG</p>

          <input type="file" multiple onChange={upload} className="hidden" />
        </label>
        {/* Uploading Files */}
        {uploads.length > 0 && (
          <div className="mt-8 bg-zinc-900 rounded-2xl p-4">
            <h2 className="font-semibold mb-4">Upload Status</h2>

            <div className="space-y-3">
              {uploads.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-zinc-800 rounded-xl px-4 py-3"
                >
                  <span>{file.name}</span>

                  <span>{file.status}</span>

                  <span className="text-sm text-zinc-400">{file.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {documents.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-xl mb-4">Uploaded Documents</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg break-all">
                        {doc.filename}
                      </h3>

                      <p className="text-zinc-400 text-sm mt-1">
                        {doc.pages} pages
                      </p>
                    </div>

                    <button
                      onClick={() => deleteDocument(doc.filename)}
                      className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {Object.entries(doc.classification || {}).map(
                      ([key, value]) => (
                        <span
                          key={key}
                          className="bg-zinc-800 px-2 py-1 rounded-lg text-xs"
                        >
                          {String(value)}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// <div className="p-10">
//   <input
//     type="file"
//     multiple
//     onChange={upload}
//     className="border p-2 w-full"
//   />
// </div>
