import bcrypt from "bcryptjs";

const passcode = "OWNER-SECRET-123"; // change this
const rounds = 12;

const hash = await bcrypt.hash(passcode, rounds);
console.log("BCRYPT HASH:\n", hash);
