import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="mt-3 text-2xl font-bold">ไม่พบหน้าที่ต้องการ</h1>
      <Link href="/" className="btn-primary mt-6">
        กลับหน้าแรก
      </Link>
    </div>
  );
}
