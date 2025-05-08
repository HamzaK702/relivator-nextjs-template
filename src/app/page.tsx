import { Footer } from "react-day-picker";

import CategorySection from "~/ui/components/category-section";
import CategoryTabs from "~/ui/components/category-tab";
import Hero from "~/ui/components/home/hero";
import SearchBar from "~/ui/components/home/search-bar";

const allMenuItems = [
  // Breakfast items
  {
    category: "Breakfast",
    description:
      "Fluffy omelette with cheese, eggs and mixed vegetables, served with toast.",
    image:
      "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=500",
    name: "Omelette",
    price: "Rs. 350",
  },
  {
    category: "Breakfast",
    description:
      "A delicious whole wheat flatbread with butter, served with yogurt and pickle.",
    image:
      "https://images.unsplash.com/photo-1589778655375-3d480abbdcc9?auto=format&fit=crop&q=80&w=500",
    name: "Paratha",
    price: "Rs. 180",
  },
  {
    category: "Drinks",
    description:
      "A warm, comforting blend of black tea with milk and aromatic spices.",
    image:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=500",
    name: "Chai",
    price: "Rs. 120",
  },
  {
    category: "Breakfast",
    description:
      "Traditional breakfast with sweet semolina halwa, fried bread, and chickpea curry.",
    image:
      "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=500",
    name: "Halwa Puri",
    price: "Rs. 450",
  },

  // Main Course items
  {
    category: "Main Course",
    description:
      "Fragrant basmati rice cooked with tender chicken pieces, aromatic spices, and herbs.",
    image:
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=500",
    name: "Chicken Biryani",
    price: "Rs. 550",
  },
  {
    category: "Main Course",
    description:
      "Slow-cooked beef stew with rich blend of spices, traditionally eaten for breakfast.",
    image:
      "https://images.unsplash.com/photo-1542367592-8849eb970fab?auto=format&fit=crop&q=80&w=500",
    name: "Beef Nihari",
    price: "Rs. 600",
  },
  {
    category: "Main Course",
    description:
      "A spicy dish of chicken cooked with tomatoes, green chilies and Pakistani spices.",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=500",
    name: "Chicken Karahi",
    price: "Rs. 750",
  },
  {
    category: "Main Course",
    description:
      "Minced meat mixed with spices and herbs, skewered and grilled to perfection.",
    image:
      "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&q=80&w=500",
    name: "Seekh Kebab",
    price: "Rs. 450",
  },

  // Dessert items
  {
    category: "Desserts",
    description:
      "Deep-fried milk solids soaked in sugar syrup, a classic Pakistani dessert.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500",
    name: "Gulab Jamun",
    price: "Rs. 250",
  },
  {
    category: "Desserts",
    description:
      "Creamy rice pudding flavored with cardamom, saffron, and garnished with nuts.",
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=500",
    name: "Kheer",
    price: "Rs. 300",
  },

  // Additional main course items
  {
    category: "Main Course",
    description:
      "Creamy lentils slow-cooked with butter, cream and aromatic spices.",
    image:
      "https://images.unsplash.com/photo-1626100134628-a6c359a0b30d?auto=format&fit=crop&q=80&w=500",
    name: "Dal Makhani",
    price: "Rs. 350",
  },
  {
    category: "Main Course",
    description:
      "Tender pieces of mutton cooked in a rich, spiced yogurt-based gravy.",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=500",
    name: "Mutton Korma",
    price: "Rs. 800",
  },
];

// Popular items (show on initial load)
const popularItems = allMenuItems.slice(0, 4);

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero />
      <SearchBar />

      <div className="flex-grow">
        {/* Featured items section */}
        <div className="bg-gray-50 py-12">
          <CategorySection
            description="Our customers' favorites that you must try"
            items={popularItems}
            title="Popular Items"
            viewAll={true}
          />
        </div>

        {/* Category tabs with filtering */}
        <CategoryTabs items={allMenuItems} />
      </div>

      <Footer />
    </div>
  );
}
