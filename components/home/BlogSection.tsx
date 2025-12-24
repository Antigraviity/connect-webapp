import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

const blogs = [
  {
    id: 1,
    title: "10 Home Improvement Projects to Boost Your Property Value",
    excerpt:
      "Discover the best home renovation projects that offer the highest return on investment...",
    category: "Home Improvement",
    date: "Oct 20, 2025",
    readTime: "5 min read",
    image: "🏡",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: 2,
    title: "The Ultimate Spring Cleaning Checklist",
    excerpt:
      "Get your home sparkling clean with our comprehensive spring cleaning guide...",
    category: "Cleaning Tips",
    date: "Oct 18, 2025",
    readTime: "7 min read",
    image: "✨",
    color: "from-green-400 to-green-600",
  },
  {
    id: 3,
    title: "How to Choose the Right Service Professional",
    excerpt:
      "Learn what to look for when hiring professionals for your home projects...",
    category: "Tips & Guides",
    date: "Oct 15, 2025",
    readTime: "6 min read",
    image: "👷",
    color: "from-orange-400 to-orange-600",
  },
  {
    id: 4,
    title: "Energy Saving Tips for Your Home",
    excerpt:
      "Reduce your electricity bills with these simple and effective energy-saving strategies...",
    category: "Sustainability",
    date: "Oct 12, 2025",
    readTime: "4 min read",
    image: "💡",
    color: "from-purple-400 to-purple-600",
  },
];

export default function BlogSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Read our daily Blogs
            </h2>
            <p className="text-gray-600">
              Stay updated with tips, guides, and industry insights
            </p>
          </div>
          <Link
            href="/blog"
            className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1"
          >
            Explore All →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.id}`}
              className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-gray-100"
            >
              {/* Image */}
              <div
                className={`relative h-48 bg-gradient-to-br ${blog.color} flex items-center justify-center`}
              >
                <span className="text-6xl">{blog.image}</span>
                <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                  {blog.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{blog.date}</span>
                  <span>•</span>
                  <span>{blog.readTime}</span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {blog.excerpt}
                </p>

                <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
