import { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Foundations',
    question: 'Which device primarily forwards frames based on MAC addresses?',
    options: ['Router', 'Switch', 'Firewall', 'AP'],
    answerIndex: 1,
    explanation: 'A switch learns MAC addresses and forwards frames within a LAN. Routers use IP addresses.',
  },
  {
    id: 'q2',
    topic: 'Foundations',
    question: 'What does the term "latency" measure?',
    options: ['Data volume', 'Time delay', 'Error rate', 'Bandwidth'],
    answerIndex: 1,
    explanation: 'Latency is the time it takes for data to travel from source to destination.',
  },
  {
    id: 'q3',
    topic: 'IPv4',
    question: 'Which of the following is a private IPv4 address range?',
    options: ['8.8.8.0/24', '192.168.0.0/16', '172.32.0.0/16', '203.0.113.0/24'],
    answerIndex: 1,
    explanation: 'RFC 1918 defines 10.0.0.0/8, 172.16.0.0/12, and 192.168.0.0/16 as private.',
  },
];
