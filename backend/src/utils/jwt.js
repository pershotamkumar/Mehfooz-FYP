import jwt from "jsonwebtoken";

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing.");
  }

  return jwt.sign(
    { id: String(id) },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export default generateToken;