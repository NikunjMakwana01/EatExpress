import React from "react";
import { Users, Award, Heart, Clock, Truck, Star } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

const AboutPage = () => {
  const { restaurantName } = useSettings();
  const stats = [
    {
      icon: Users,
      number: "10,000+",
      label: "Happy Customers",
    },
    {
      icon: Award,
      number: "50+",
      label: "Restaurant Partners",
    },
    {
      icon: Clock,
      number: "30 min",
      label: "Average Delivery",
    },
    {
      icon: Star,
      number: "4.8",
      label: "Customer Rating",
    },
  ];

  const team = [
    {
      name: "Nikunj Makwana",
      position: "CEO & Founder",
      image:
        "",
      bio: "Passionate about revolutionizing food delivery with technology and customer satisfaction.",
    },
    {
      name: "Dakshesh Makwana",
      position: "Head of Operations",
      image:
        "",
      bio: "Ensuring smooth operations and maintaining high service standards across all locations.",
    },
    {
      name: "Meet Prajapati",
      position: "Head of Technology",
      image:
        " ",
      bio: "Building innovative solutions to enhance user experience and platform performance.",
    },
    {
      name: "Tirth Patel",
      position: "Head of Marketing",
      image:
        "",
      bio: "Creating compelling campaigns and building strong relationships with our community.",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "We prioritize customer satisfaction above everything else.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable delivery service to your doorstep.",
    },
    {
      icon: Star,
      title: "Quality Assured",
      description: "Partnering with the best restaurants for quality food.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support for your convenience.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About {restaurantName}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
            We're on a mission to connect people with the best food from their
            favorite restaurants, delivered right to their doorstep.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At {restaurantName}, we believe that great food has the power to
                bring people together. Our mission is to make delicious,
                high-quality food accessible to everyone, anytime, anywhere.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We partner with the best local restaurants to bring you a
                diverse selection of cuisines, from traditional favorites to
                innovative new dishes. Our commitment to quality, speed, and
                customer satisfaction drives everything we do.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">
                    Partnering with top-rated restaurants
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">
                    Ensuring fast and reliable delivery
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">
                    Providing exceptional customer service
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-gray-400 text-6xl"><img src="./public/ourmission.avif" alt="Our Mission" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and help us deliver the
              best possible experience to our customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our dedicated team works tirelessly to ensure you get the best
              food delivery experience possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">
                  {member.position}
                </p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-gray-400 text-6xl"><img src="./public/ourstory.avif" alt="Our Story" /></div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {restaurantName} was founded in 2020 with a simple vision: to make
                food delivery faster, more reliable, and more convenient than
                ever before. What started as a small startup has grown into one
                of the region's leading food delivery platforms.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Today, we serve thousands of customers daily, partnering with
                hundreds of restaurants to bring you the best food from your
                favorite local spots. Our commitment to quality, speed, and
                customer satisfaction remains at the heart of everything we do.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Founded in 2020</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">
                    Serving 10,000+ customers daily
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">
                    Partnering with 50+ restaurants
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Great Food?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of satisfied customers who trust us for their daily
            meals.
          </p>
          <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Ordering Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
