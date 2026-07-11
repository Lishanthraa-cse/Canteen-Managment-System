const Input = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col">
      <label className="font-medium">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="border p-2 rounded-md"
      />
    </div>
  );
};

export default Input;
