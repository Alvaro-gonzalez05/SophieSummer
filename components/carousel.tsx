"use client";

import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import styles from "./carousel.module.css";
import Banner1 from "./assets/Banner1.jpg";
import Banner2 from "./assets/Banner2.jpg";
import {Slide} from "react-awesome-reveal"

const images = [
  { src: Banner1, alt: "Summer Collection" },
  { src: Banner2, alt: "New Arrivals" },
  { src: "/placeholder.svg?height=500&width=1920", alt: "Placeholder" },
];

export default function CustomCarousel() {
  return (
    <Slide direction="left"><div className={styles.carouselContainer}>
      <Carousel
        showArrows={true}
        autoPlay={true}
        infiniteLoop={true}
        showThumbs={false}
        showStatus={false}
        interval={5000}
      >
        {images.map((image, index) => (
          <div key={index}>
            <Image 
              src={image.src} 
              alt={image.alt} 
              width={1920} 
              height={550} 
              className={styles.imagencarrusel}
            />

          </div>
        ))}
      </Carousel>
    </div></Slide>
  );
}
