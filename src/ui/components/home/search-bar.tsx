import { Search } from "lucide-react";

import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";

const SearchBar = () => {
  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto flex max-w-3xl">
          <div
            className={`
              pointer-events-none absolute inset-y-0 left-0 flex items-center
              pl-4
            `}
          >
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            className={`
              focus:border-restaurant-primary focus:ring-restaurant-primary
              w-full rounded-full border-gray-200 py-6 pr-28 pl-12
            `}
            placeholder="Search for your favorite dishes..."
            type="text"
          />
          <Button
            className={`
              bg-restaurant-primary absolute top-1/2 right-1.5 -translate-y-1/2
              rounded-full px-5
              hover:bg-restaurant-accent
            `}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
