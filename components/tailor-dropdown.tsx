import { User } from "@/lib/model/user";

interface TailorDropdownProps {
  tailors: User[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}

const TailorDropdown: React.FC<TailorDropdownProps> = ({
  tailors,
  selectedId,
  onSelect,
  disabled,
}) => {
  console.log("Rendering TailorDropdown with tailors:", tailors);
  return (
    <div className="mb-4">
      <label
        htmlFor="tailor-select"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Select Tailor
      </label>
      <select
        id="tailor-select"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300  rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled className="text-meti-teal">
          -- Choose a Tailor --
        </option>
        {tailors.map((tailor) => (
          <option
            key={tailor.user_id}
            value={tailor.user_id}
            className="text-meti-teal"
          >
            {tailor.username}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TailorDropdown;
