
import type { Product, User, Review, Transaction, Conversation, Message, Order } from '../types';
import { mockProducts, mockUsers as initialMockUsers, mockReviews, mockTransactions, mockOrders as initialMockOrders } from '../constants';
import { OrderStatus } from '../types';

// This file simulates a backend API.
// In a real application, these functions would make network requests (e.g., using fetch).

// Make mock data mutable for auth simulations
let mockUsers: User[] = [...initialMockUsers];
let mockOrders: Order[] = [...initialMockOrders];

const socialUserGoogle: User = { id: 'u-google', name: 'Amine Google', avatarUrl: 'https://picsum.photos/seed/u-google/100/100', city: 'Casablanca', rating: 4.2, reviews: 5, memberSince: "Aujourd'hui", balance: 50.00, isPro: false };
const socialUserFacebook: User = { id: 'u-facebook', name: 'Leila Facebook', avatarUrl: 'https://picsum.photos/seed/u-facebook/100/100', city: 'Rabat', rating: 4.9, reviews: 22, memberSince: "Aujourd'hui", balance: 120.00, isPro: false };

let mockConversations: Conversation[] = [
    {
        id: 'c1',
        participants: [initialMockUsers[0], initialMockUsers.find(u => u.id === 'admin')!],
        product: mockProducts[7],
        messages: [
            { id: 'm1', senderId: 'admin', text: 'Bonjour, vos babouches sont-elles toujours disponibles ?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { id: 'm2', senderId: 'u1', text: 'Oui, toujours !', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
        ],
        lastMessageTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'c2',
        participants: [initialMockUsers[1], initialMockUsers.find(u => u.id === 'admin')!],
        product: mockProducts[4],
        messages: [
            { id: 'm3', senderId: 'admin', text: 'Salam, le jeu est en bon état ? Pas de rayures ?', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        ],
        lastMessageTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    }
];

const api = {
  // PRODUCT & GENERAL API
  getProducts: (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProducts)
      }, 500); // Simulate network delay
    });
  },

  getUsers: (): Promise<User[]> => {
     return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUsers)
      }, 500);
    });
  },

  getReviews: (): Promise<Review[]> => {
     return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockReviews)
      }, 500);
    });
  },
  
  getTransactions: (): Promise<Transaction[]> => {
     return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTransactions)
      }, 500);
    });
  },

  getOrders: (): Promise<Order[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockOrders)
      }, 500);
    });
  },

  createOrder: (product: Product, buyer: User, buyerProtectionFee: number, shippingFee: number, totalAmount: number): Promise<Order> => {
     return new Promise((resolve) => {
        setTimeout(() => {
            const newOrder: Order = {
                id: `o${Date.now()}`,
                product,
                buyer,
                seller: product.seller,
                status: OrderStatus.Paid,
                totalAmount,
                buyerProtectionFee,
                shippingFee,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrders.unshift(newOrder);
            resolve(newOrder);
        }, 1000); // Simulate payment processing
     });
  },

  // AUTH API
  login: (email: string, password: string): Promise<User> => {
      console.log('Attempting login for:', email);
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              // Special check for admin user
              if (email === 'admin@diali.closet') {
                  if (password === 'admin123') {
                      const adminUser = mockUsers.find(u => u.id === 'admin');
                      if (adminUser) {
                          resolve(adminUser);
                          return;
                      }
                  } else {
                      reject(new Error('Mot de passe administrateur incorrect.'));
                      return;
                  }
              }

              // In a real app, you'd check a hashed password. Here we mock it.
              // We don't have emails, so let's pretend the user ID is the email prefix.
              const foundUser = mockUsers.find(u => `${u.id}@diali.closet` === email);
              if (foundUser) {
                  resolve(foundUser);
              } else {
                  reject(new Error('Email ou mot de passe incorrect.'));
              }
          }, 1000);
      });
  },

  signup: (name: string, email: string, password: string): Promise<User> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
               const emailExists = mockUsers.some(u => `${u.id}@diali.closet` === email);
               if (emailExists) {
                   reject(new Error('Un compte avec cet email existe déjà.'));
                   return;
               }

               const newUser: User = {
                   id: `u${mockUsers.length + 5}`, // create a new unique ID
                   name,
                   avatarUrl: `https://picsum.photos/seed/u-new-${name}/100/100`,
                   city: 'Inconnue',
                   rating: 0,
                   reviews: 0,
                   memberSince: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
                   balance: 0,
                   isPro: false,
               };
               mockUsers.push(newUser);
               resolve(newUser);
          }, 1000);
      });
  },
  
  loginWithGoogle: (): Promise<User> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              if (!mockUsers.some(u => u.id === socialUserGoogle.id)) {
                  mockUsers.push(socialUserGoogle);
              }
              resolve(socialUserGoogle);
          }, 800);
      })
  },

  loginWithFacebook: (): Promise<User> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              if (!mockUsers.some(u => u.id === socialUserFacebook.id)) {
                  mockUsers.push(socialUserFacebook);
              }
              resolve(socialUserFacebook);
          }, 800);
      })
  },

  getUserById: (userId: string): Promise<User> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const allUsers = [...mockUsers, socialUserGoogle, socialUserFacebook];
              const user = allUsers.find(u => u.id === userId);
              if (user) {
                  resolve(user);
              } else {
                  reject(new Error('User not found'));
              }
          }, 200);
      });
  },
  
  // CHAT API
  getConversationsForUser: (userId: string): Promise<Conversation[]> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const conversations = mockConversations
                  .filter(c => c.participants.some(p => p.id === userId))
                  .sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
              resolve(conversations);
          }, 500);
      });
  },
  
  sendMessage: (conversationId: string, text: string, senderId: string): Promise<Message> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              const conversation = mockConversations.find(c => c.id === conversationId);
              if (conversation) {
                  const newMessage: Message = {
                      id: `m${Date.now()}`,
                      senderId,
                      text,
                      timestamp: new Date().toISOString()
                  };
                  conversation.messages.push(newMessage);
                  conversation.lastMessageTimestamp = newMessage.timestamp;
                  resolve(newMessage);
              } else {
                  reject(new Error("Conversation not found"));
              }
          }, 300);
      });
  },

  findOrCreateConversation: (user1: User, user2: User, product: Product): Promise<Conversation> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              let conversation = mockConversations.find(c => 
                  c.product.id === product.id &&
                  c.participants.some(p => p.id === user1.id) &&
                  c.participants.some(p => p.id === user2.id)
              );

              if (!conversation) {
                  conversation = {
                      id: `c${Date.now()}`,
                      participants: [user1, user2],
                      product: product,
                      messages: [],
                      lastMessageTimestamp: new Date().toISOString(),
                  };
                  mockConversations.unshift(conversation);
              }
              resolve(conversation);
          }, 200);
      });
  }
};

export default api;
