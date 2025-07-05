import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: 'Raquibbi Muhammaddi',
    quote: `I brought my E92 to here and Tony did an incredible job on it. He fixed a small dent/paint chip in my hood and perfectly paint matched it. He also painted and installed an aftermarket M Sport front bumper, splitter, and trunk lip. Everything he did looks flush and OEM, like it came straight from the factory.

Even when he ran into an unexpected issue (a cracked headlight bracket from the previous owner that I missed in my purchase inspection), he handled it quickly and still got my car back to me faster than expected.

Tony was transparent, professional, and communicative throughout the entire process.

If you’re looking for high quality paint and bodywork with solid turnaround time and honest service, Tony is your guy.

I am already planning out other mods to my car that I will be having him install exclusively.

Highly, highly, highly recommend!!!`,
  },
  {
    name: 'Anissa Boston',
    quote: `A++ from start to finish… my number was given to the owner and he reached out to me which says a lot. But in that we communicate and he was very understanding and was helpful. I needed a new headlamp and had been looking at one. He seen the same one I seen. What I love about his business he was forthcoming the price he charged was the price I would have paid if I had bought it myself.

Love that he is a veteran who served for our freedom. Meanwhile if you need other things done he has a list of good people he can refer you to. He is now someone I would send my mama to if she needed help. He cares and wants to help… 🙏🏾🫶🏾💪🏾`,
  },
  {
    name: 'Ozzie Ruiz',
    quote: `Tony and his team are top tier! Tony has a great attention to detail. Very welcoming and great experience working with this family owned shop. My Lexus came in with 20 years of rock chips, door dings and wear. Now it reminds me of the day we took delivery at Lexus. I will definitely recommend to friends, family, and neighbors. It is also nice to support veterans.`,
  },
  {
    name: 'Rose B',
    quote: `I'm so happy I found Tony. My vehicle was damaged and Tony gave me the first estimate. I didn't even go to another place. Tony is meticulous, pricing was reasonable, great personality, excellent service and top quality work. I will never use another body shop in Houston as long as Tony is available. Very happy with the finished look. Please support this Veteran.`,
  },
  {
    name: 'Franklin Rocha',
    quote: `Highly recommended, pays attention to details and very affordable! If they find any damages while repairing, he doesn’t just fix it and then bill you. He will call you and tell you what he found and see what you want to do before he proceeds. I didn't have a major repair but he took care of it like it was and made it look like nothing ever happened.`,
  },
];

export default function TestimonialSlider() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const interval = setInterval(next, 12000); // auto-advance every 12 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-5xl mx-auto mt-20 px-6 py-10 text-center text-white bg-[#3a1f1a]/40 rounded-lg shadow-lg backdrop-blur-md">
      <h2 className="text-3xl font-bold mb-6">What Our Customers Say</h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <p className="italic text-base md:text-lg leading-relaxed max-w-4xl mx-auto whitespace-pre-line">“{testimonials[index].quote}”</p>
          <p className="text-brandRed font-semibold text-sm md:text-base">— {testimonials[index].name}</p>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-1/2 -translate-y-1/2 left-4 cursor-pointer" onClick={prev}>
        <ChevronLeft size={28} className="text-white hover:text-brandRed transition" />
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer" onClick={next}>
        <ChevronRight size={28} className="text-white hover:text-brandRed transition" />
      </div>
    </div>
  );
}
