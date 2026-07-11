const Button = ({ children, onClick }) => {
  return (
    <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
