import alligator from "../assets/avatars/crocodile.jpg";
import bunny from "../assets/avatars/bunny.jpg";
import dog from "../assets/avatars/dog.jpg";
import parrot from "../assets/avatars/parrot.jpg";
import raccoon from "../assets/avatars/racoon.jpg";

export type Avatar = {
    id: string;
    label: string;
    src: string;
};

export const avatars: Avatar[] = [
    {id: "parrot", label: "Parrot", src: parrot},
    {id: "crocodile", label: "Crocodile", src: alligator},
    {id: "dog", label: "Dog", src: dog},
    {id: "raccoon", label: "Raccoon", src: raccoon},
    {id: "bunny", label: "Bunny", src: bunny},
];
