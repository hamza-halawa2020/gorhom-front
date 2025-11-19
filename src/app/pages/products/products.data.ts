export interface Product {
  id: string;
  name: string;
  price?: string;
  excerpt: string;
  description: string;
  images?: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'hps-1',
    name: 'HPS Light Drone',
    price: '$12,000',
    excerpt: 'A lightweight reconnaissance drone powered by the Humming Propulsion System.',
    description: `The HPS Light Drone is optimized for endurance and low noise. Features include modular payloads, autonomous navigation, and long-range communication.`,
    images: ['assets/img/1.jpeg','assets/img/1.jpeg'],
  },
  {
    id: 'hps-2',
    name: 'HPS Urban Commuter',
    price: '$85,000',
    excerpt: 'A compact urban air vehicle for short-range commuting.',
    description: `Designed for city travel with safety-first architecture, foldable rotors, and quiet operation. Capacity for 2 passengers.`,
    images: ['assets/img/1.jpeg'],
  },
  {
    id: 'hps-3',
    name: 'HPS Cargo Pod',
    price: '$45,000',
    excerpt: 'A cargo module for lightweight logistics and last-mile delivery.',
    description: `Modular cargo pod compatible with HPS lift systems. Built-in temperature control and secure locking.`,
    images: ['assets/img/1.jpeg'],
  },
  {
    id: 'hps-4',
    name: 'HPS Research Platform',
    price: 'Contact us',
    excerpt: 'A flexible research platform for testing HPS subsystems.',
    description: `Configured for instrumentation, sensor arrays and high-fidelity data logging to accelerate R&D cycles.`,
    images: ['assets/img/1.jpeg'],
  },
  {
    id: 'hps-5',
    name: 'HPS Trainer',
    price: '$22,000',
    excerpt: 'A training rig for pilots to get familiar with HPS controls and handling.',
    description: `Includes dual controls, simulated failure modes, and integrated telemetry for instructor review.`,
    images: ['assets/img/1.jpeg'],
  },
];
