import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
}

export const compareHash = async (password: string, userPassword: string) => {
  const isMatch = await bcrypt.compare(password, userPassword);
  return isMatch;
}