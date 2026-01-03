import { mockAdminUser, mockUser, noUser } from "./user";

const chooseUser = "user";
let chosenUser;

if (chooseUser === "user") {
    chosenUser = mockUser;
} else if (chooseUser === "admin") {
    chosenUser = mockAdminUser;
} else {
    chosenUser = noUser;
}

export const currentUser = chosenUser;
