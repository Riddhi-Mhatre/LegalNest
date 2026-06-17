import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { createProperty } from "../services/propertyService";

export default function AddPropertyPage() {
  const { user } = useAuthStore();

  const [property, setProperty] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    state: "",
    type: "rent",
    bedrooms: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setProperty({
      ...property,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async () => {
    try {
      // Sirf form ka data bhejna hai.
      // sellerId, verificationStatus aur createdAt backend khud handle karega.
      const data = {
        ...property,
        price: Number(property.price),
        bedrooms: Number(property.bedrooms),
      };

      await createProperty(data);

      alert("✅ Property Added Successfully!");

      // Form reset
      setProperty({
        title: "",
        description: "",
        price: "",
        city: "",
        state: "",
        type: "rent",
        bedrooms: "",
      });
    } catch (error) {
      console.error(error);
      alert("❌ Property Add karte waqt error aaya.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        Add New Property
      </h1>

      <input
        className="block p-4 bg-gray-900 mb-4 w-full"
        name="title"
        placeholder="Property Title"
        value={property.title}
        onChange={handleChange}
      />

      <textarea
        className="block p-4 bg-gray-900 mb-4 w-full"
        name="description"
        placeholder="Description"
        value={property.description}
        onChange={handleChange}
      />

      <select
        className="block p-4 bg-gray-900 mb-4"
        name="type"
        value={property.type}
        onChange={handleChange}
      >
        <option value="rent">Rent</option>
        <option value="sale">Sale</option>
      </select>

      <input
        className="block p-4 bg-gray-900 mb-4"
        name="price"
        type="number"
        placeholder="Price"
        value={property.price}
        onChange={handleChange}
      />

      <input
        className="block p-4 bg-gray-900 mb-4"
        name="city"
        placeholder="City"
        value={property.city}
        onChange={handleChange}
      />

      <input
        className="block p-4 bg-gray-900 mb-4"
        name="state"
        placeholder="State"
        value={property.state}
        onChange={handleChange}
      />

      <input
        className="block p-4 bg-gray-900 mb-4"
        name="bedrooms"
        type="number"
        placeholder="Bedrooms"
        value={property.bedrooms}
        onChange={handleChange}
      />

      <button
        onClick={submit}
        className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold"
      >
        Submit Property
      </button>
    </div>
  );
}