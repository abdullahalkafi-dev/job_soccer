const newFileName = (
  file: { originalname: string },
  path: { parse: (filename: string) => { name: string } }
): string => {
  const date = new Date();
  const formattedDate = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`;

  const originalNameWithoutExt = path.parse(file.originalname).name;
  const fileName =
    originalNameWithoutExt.toLowerCase().split(" ").join("-") +
    "-" +
    randomCode() +
    "-" +
    formattedDate;

  return fileName;
};
const randomCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default newFileName;
