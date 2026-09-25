<template>
  <div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div 
        class="order-2 lg:order-1"
        v-motion
        :initial="{ opacity: 0, x: -50 }"
        :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 800 } }"
      >
        <h2 class="font-serif text-3xl md:text-4xl mb-6">The Story Behind the Lens</h2>
        <div class="space-y-4 text-primary-700 dark:text-primary-300">
          <p>
            With over a 3 years of experience capturing life's most precious moments, I've developed a unique style that blends artistry with authenticity. My journey began with a camera that I used my tuition fee when I was first in college to buy it, and has evolved into a lifelong passion for visual storytelling.
          </p>
          <p>
            I believe photography is about more than just beautiful images—it's about preserving emotions, connections, and moments that might otherwise be forgotten. Whether I'm photographing a quiet landscape at dawn or the peaceful environment in the middle of no where, I approach each assignment with the same dedication to excellence and authentic representation.
          </p>
          <p>
            When I'm not behind the camera, you'll find me exploring new locations on the internet, experimenting with different techniques, or spending time with my family. I bring this balanced perspective to all my work, allowing me to connect with clients and subjects in a meaningful way.
          </p>
          <p>
            I look forward to the opportunity to tell your story through my lens.
          </p>
        </div>
        
        <!-- <div class="mt-8 flex flex-wrap gap-4">
          <div class="flex items-center">
            <div class="mr-3 text-accent-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium">Award-Winning</h3>
              <p class="text-sm text-primary-500 dark:text-primary-400">National Photography Awards</p>
            </div>
          </div>
          
          <div class="flex items-center">
            <div class="mr-3 text-accent-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 class="font-medium">Published</h3>
              <p class="text-sm text-primary-500 dark:text-primary-400">Featured in Photography Magazines</p>
            </div>
          </div>
        </div> -->
      </div>
      
      <div 
        class="order-1 lg:order-2"
        v-motion
        :initial="{ opacity: 0, x: 50 }"
        :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 800 } }"
      >
        <div class="relative">
          <img 
            src="https://res.cloudinary.com/dqved9nx9/image/upload/v1754670214/IMG_20250201_011838_988_ecfzaf.webp" 
            alt="Photographer portrait" 
            class="w-full rounded-sm shadow-lg"
          />
          <!-- <div class="absolute -bottom-6 -left-6 bg-accent-500 text-primary-900 p-4 rounded-sm shadow-lg font-serif text-lg">
            10+ Years Experience
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>