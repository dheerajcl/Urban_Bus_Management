import { redirect } from 'next/navigation'
import Image from "next/image"

export default function Home() {
  redirect('/login')

  // The following code will not be executed due to the redirect,
  // but we'll keep it as a fallback in case the redirect fails

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/placeholder.svg?height=38&width=180"
          alt="Urban Bus Management logo"
          width={180}
          height={38}
          priority
        />
        <p className="text-center sm:text-left">
          Redirecting to login page...
        </p>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p className="text-sm text-muted-foreground">
          © 2023 Urban Bus Management. All rights reserved.
        </p>
      </footer>
    </div>
  )
}