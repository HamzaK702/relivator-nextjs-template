import { Footer } from "react-day-picker";

import CategorySection from "~/ui/components/category-section";
import CategoryTabs from "~/ui/components/category-tab";
import Hero from "~/ui/components/home/hero";
import SearchBar from "~/ui/components/home/search-bar";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero />
      <SearchBar />
      <div className="flex-grow">
        <div className="bg-gray-50 py-12">
          <CategorySection title="Popular Items" />
        </div>
        <CategoryTabs />
      </div>
      <Footer />
    </div>
  );
}
