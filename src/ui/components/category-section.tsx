import FoodItem from "./food-item";

interface CategorySectionProps {
  description?: string;
  items: FoodItemType[];
  title: string;
  viewAll?: boolean;
}

interface FoodItemType {
  category?: string;
  description: string;
  image: string;
  name: string;
  price: string;
}

const CategorySection = ({
  description,
  items,
  title,
  viewAll = false,
}: CategorySectionProps) => {
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="mb-8">
            <h2
              className={`
                mb-2 text-2xl font-bold text-gray-800
                md:text-3xl
              `}
            >
              {title}
            </h2>
            {description && (
              <p className="max-w-2xl text-gray-600">{description}</p>
            )}
          </div>
          {viewAll && (
            <a
              className={`
                text-restaurant-primary font-medium
                hover:underline
              `}
              href="#"
            >
              View All
            </a>
          )}
        </div>
        <div
          className={`
            grid grid-cols-1 gap-6
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          `}
        >
          {items.map((item, index) => (
            <FoodItem
              description={item.description}
              image={item.image}
              key={index}
              name={item.name}
              price={item.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
