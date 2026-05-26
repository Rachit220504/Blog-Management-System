import BlogCard from './blog-card';

export default function RelatedPosts({ posts = [] }) {
  if (!posts.length) return null;

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Related posts</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Keep reading</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
