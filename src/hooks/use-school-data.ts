"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { collection, doc, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import type { Player, AttendanceRecord, FitnessAssessment, SportSkill, HealthIncident, SchoolProfile, ExamLabels, PerformanceLabels, TacticalEvent, GoalRecord } from '@/lib/types';
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format } from 'date-fns';
import { guessMarathiName } from '@/lib/utils';

const OFFLINE_ATTENDANCE_KEY = 'wgb_offline_attendance_queue';

const DEFAULT_U17_PLAYERS: Player[] = [
  { id: "u17_b1", name: "Uniram Yogesh Gavit", nameMarathi: "उणीराम योगेश गावीत", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b2", name: "Pankaj Ramesh Pawar", nameMarathi: "पंकज रमेश पवार", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b3", name: "Nikhil Kalu Suryawanshi", nameMarathi: "निखिल काळू सूर्यवंशी", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b4", name: "Ankush Dattu Sonawane", nameMarathi: "अंकुश दत्तू सोनवणे", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b5", name: "Parshuram Vishwsh Chavan", nameMarathi: "परशुराम विश्वास चव्हाण", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b6", name: "Bhusan Suresh Bhoye", nameMarathi: "भूषण सुरेश भोये", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b7", name: "Yash Gangram Kamdi", nameMarathi: "यश गंगाराम कामडी", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b8", name: "Sagar Manohar Thakre", nameMarathi: "सागर मनोहर ठाकरे", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b9", name: "Krushna Laxman Shinde", nameMarathi: "कृष्णा लक्ष्मण शिंदे", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b10", name: "Vijay Sanjay Bahiram", nameMarathi: "विजय संजय बहिराम", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b11", name: "Rushikesh Bebilal Gavali", nameMarathi: "ऋषिकेश बेबीलाल गवळी", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b12", name: "Ravi Raju Pawar", nameMarathi: "रवी राजू पवार", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b13", name: "Suresh Devram Pawar", nameMarathi: "सुरेश देवराम पवार", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "u17_b14", name: "Karan Raju Gavit", nameMarathi: "करण राजू गावीत", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },

  { id: "u17_g1", name: "Laxmi Bagul", nameMarathi: "लक्ष्मी बागुल", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g2", name: "Dipali Pawar", nameMarathi: "दीपाली पवार", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g3", name: "Anusaya Khandavi", nameMarathi: "अनुसया खंडावी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g4", name: "Sangita Gangurde", nameMarathi: "संगीता गांगुर्डे", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g5", name: "Sangita Chaudhari", nameMarathi: "संगीता चौधरी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g6", name: "Arti Khair", nameMarathi: "आरती खैर", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g7", name: "Bhaghsree Gavali", nameMarathi: "भाग्यश्री गवळी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g8", name: "Asha Suryawanshi", nameMarathi: "आशा सूर्यवंशी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g9", name: "Pinti Mahale", nameMarathi: "पिंटी महाले", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g10", name: "Dhanshree Deshmukh", nameMarathi: "धनश्री देशमुख", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g11", name: "Dhavali Chaudhari", nameMarathi: "ढवळी चौधरी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g12", name: "Mohini Mahale", nameMarathi: "मोहिनी महाले", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g13", name: "Pooja Devidas Bagul", nameMarathi: "पूजा देवीदास बागुल", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "u17_g14", name: "Aarti Soma Pawar", nameMarathi: "आरती सोमा पवार", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" }
];

const DEFAULT_U14_PLAYERS: Player[] = [
  { id: "u14_b1", name: "Ravindra Chotiram Suryawanshi", nameMarathi: "रवींद्र छोतीराम सूर्यवंशी", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b2", name: "Dadaji Ramdas Bhoye", nameMarathi: "दादाजी रामदास भोये", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b3", name: "Arjun Chotiram Suryawanshi", nameMarathi: "अर्जुन छोतीराम सूर्यवंशी", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b4", name: "Ravindra Soma Kamdi", nameMarathi: "रवींद्र सोमा कामडी", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b5", name: "Pravin Shantaram Bahiram", nameMarathi: "प्रवीण शांताराम बहिराम", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b6", name: "Sravan Hiraman Mali", nameMarathi: "श्रावण हिरामन माळी", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b7", name: "Bhavdas Popat Chaure", nameMarathi: "भावदास पोपट चौरे", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b8", name: "Rodhan Ram Thakre", nameMarathi: "रोधन राम ठाकरे", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b9", name: "Avinash Dhalu Kamdi", nameMarathi: "अविनाश ढाळू कामडी", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b10", name: "Somnath Sitaram Bhoye", nameMarathi: "सोमनाथ सीताराम भोये", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b11", name: "Ganesh Hiraman Bhoye", nameMarathi: "गणेश हिरामन भोये", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b12", name: "Rahul Popat Chaure", nameMarathi: "राहुल पोपट चौरे", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b13", name: "Vikram Soma Kamdi", nameMarathi: "विक्रम सोमा कामडी", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },
  { id: "u14_b14", name: "Aditya Ramdas Bhoye", nameMarathi: "आदित्य रामदास भोये", gender: "Male", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "40", height: "145", bmi: "19.0" },

  { id: "u14_g1", name: "Harshai Deshmukh", nameMarathi: "हर्षाली देशमुख", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g2", name: "Kalyani Gavit", nameMarathi: "कल्याणी गावीत", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g3", name: "Rekha Jople", nameMarathi: "रेखा जोपळे", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g4", name: "Madhuri Jople", nameMarathi: "माधुरी जोपळे", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g5", name: "Madhari Chaudhari", nameMarathi: "माधुरी चौधरी", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g6", name: "Gita Bagul", nameMarathi: "गीता बागुल", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g7", name: "Sonali Chaure", nameMarathi: "सोनाली चौरे", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g8", name: "Gaytri Deshmukh", nameMarathi: "गायत्री देशमुख", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g9", name: "Kirti", nameMarathi: "कीर्ती", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g10", name: "Pratiksha Shantaram Bahiram", nameMarathi: "प्रतीक्षा शांताराम बहिराम", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g11", name: "Roshni Chotiram Suryawanshi", nameMarathi: "रोशनी छोतीराम सूर्यवंशी", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g12", name: "Kajal Kalu Suryawanshi", nameMarathi: "काजल काळू सूर्यवंशी", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g13", name: "Anjali Dattu Sonawane", nameMarathi: "अंजली दत्तू सोनवणे", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" },
  { id: "u14_g14", name: "Snehal Ramesh Pawar", nameMarathi: "स्नेहल रमेश पवार", gender: "Female", std: "7", dob: "2014-06-01", category: "athlete", sports: ["Kabaddi", "Volleyball", "Kho Kho"], history: "No", age: 12, ageCategory: "U14", weight: "38", height: "140", bmi: "19.4" }
];

const DEFAULT_KHOKHO_PLAYERS: Player[] = [
  { id: "kk_b1", name: "Haresh", nameMarathi: "हरेश", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b2", name: "Ravindra", nameMarathi: "रवींद्र", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b3", name: "Ramesh Valu Ahire", nameMarathi: "रमेश वाळू अहिरे", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b4", name: "Dipak Shantaram Bahiram", nameMarathi: "दीपक शांताराम बहिराम", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b5", name: "Amit Eknath Gangurde", nameMarathi: "अमित एकनाथ गांगुर्डे", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b6", name: "Sai Kalu Aahire", nameMarathi: "साई काळू अहिरे", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b7", name: "Roshan Shitaram Jadhav", nameMarathi: "रोशन सीताराम जाधव", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b8", name: "Ram Gotu Ahire", nameMarathi: "राम गोटू अहिरे", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b9", name: "Ashwin Prabhu Bhoye", nameMarathi: "अश्विन प्रभू भोये", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b10", name: "Chetan Madhu Chure", nameMarathi: "चेतन मधू चौरे", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b11", name: "Sandip Shitaram Jadhav", nameMarathi: "संदीप सीताराम जाधव", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b12", name: "Swapnil Gotu Ahire", nameMarathi: "स्वप्निल गोटू अहिरे", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b13", name: "Sachin Madhu Chure", nameMarathi: "सचिन मधू चौरे", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },
  { id: "kk_b14", name: "Vijay Prabhu Bhoye", nameMarathi: "विजय प्रभू भोये", gender: "Male", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "50", height: "165", bmi: "18.4" },

  { id: "kk_g1", name: "Kalyani Gaikwad", nameMarathi: "कल्याणी गायकवाड", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g2", name: "Gagruti Deshmukh", nameMarathi: "जागृती देशमुख", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g3", name: "Ashwini Chaure", nameMarathi: "अश्विनी चौरे", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g4", name: "Ravina Pawar", nameMarathi: "रवीना पवार", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g5", name: "Tulshi Chaudhari", nameMarathi: "तुळशी चौधरी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g6", name: "Manju Chaudhari", nameMarathi: "मंजू चौधरी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g7", name: "Anju Chaudhari", nameMarathi: "अंजू चौधरी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g8", name: "Gita Bagul", nameMarathi: "गीता बागुल", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g9", name: "Sonali Chaudhari", nameMarathi: "सोनाली चौधरी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g10", name: "Nisha Gaikwad", nameMarathi: "निशा गायकवाड", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g11", name: "Sanjana Deshmukh", nameMarathi: "संजना देशमुख", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g12", name: "Sneha Pawara", nameMarathi: "स्नेहा पवारा", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g13", name: "Rupali Chaudhari", nameMarathi: "रूपाली चौधरी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "kk_g14", name: "Priyanka Bagul", nameMarathi: "प्रियंका बागुल", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Kho Kho"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" }
];

const DEFAULT_SHOTPUT_GIRLS: Player[] = [
  { id: "sp_g1", name: "Tanvi Vijay Choudhari", nameMarathi: "तन्वी विजय चौधरी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g2", name: "Shital Ragunath Bagul", nameMarathi: "शीतल रघुनाथ बागुल", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g3", name: "Harshali Sajan Mahale", nameMarathi: "हर्षाली साजन महाले", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g4", name: "Tanvi Bajan Mahale", nameMarathi: "तन्वी भाजन महाले", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g5", name: "Pragati Vijay Choudhari", nameMarathi: "प्रगती विजय चौधरी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g6", name: "Kavita Ragunath Bagul", nameMarathi: "कविता रघुनाथ बागुल", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g7", name: "Vaishali Sajan Mahale", nameMarathi: "वैशाली साजन महाले", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g8", name: "Deepali Bajan Mahale", nameMarathi: "दीपाली भाजन महाले", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g9", name: "Meena Devram Pawar", nameMarathi: "मीना देवराम पवार", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g10", name: "Manisha Raju Gavit", nameMarathi: "मनीषा राजू गावीत", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g11", name: "Neha Shantaram Bahiram", nameMarathi: "नेहा शांताराम बहिराम", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g12", name: "Sharda Chotiram Suryawanshi", nameMarathi: "शारदा छोतीराम सूर्यवंशी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g13", name: "Rekha Kalu Suryawanshi", nameMarathi: "रेखा काळू सूर्यवंशी", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" },
  { id: "sp_g14", name: "Sunita Dattu Sonawane", nameMarathi: "सुनिता दत्तू सोनवणे", gender: "Female", std: "9", dob: "2011-06-01", category: "athlete", sports: ["Shot Put", "Discus Throw", "Javelin Throw", "Running"], history: "No", age: 15, ageCategory: "U17", weight: "45", height: "155", bmi: "18.7" }
];

/**
 * useSchoolData - Institutional Registry Engine v4.3.26
 * Hardened for high-resilience persistence and strict hook execution order.
 */
export function useSchoolData(isActive: boolean = true) {
  // 1. ALL Hook definitions MUST remain at the top level
  const db = useFirestore();
  const { user } = useUser();
  const syncLockRef = useRef(false);

  const [selectedYear, setSelectedYear] = useState("2024-25");
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [attendance, setAttendanceData] = useState<AttendanceRecord>({});
  const [fitness, setFitnessData] = useState<Record<string, FitnessAssessment>>({});
  const [fitnessHistory, setFitnessHistory] = useState<Record<string, FitnessAssessment[]>>({});
  const [sportSkills, setSportSkillsData] = useState<Record<string, SportSkill>>({});
  const [skillsHistory, setSkillsHistory] = useState<Record<string, (SportSkill & { sportName: string })[]>>({});
  const [gameRules, setGameRulesData] = useState<Record<string, any>>({});
  const [examConfigs, setExamConfigs] = useState<Record<string, ExamLabels>>({});
  const [performanceConfigs, setPerformanceConfigs] = useState<Record<string, PerformanceLabels>>({});
  const [dailyReadiness, setDailyReadinessData] = useState<Record<string, any>>({});
  const [tacticalEvents, setTacticalEventsData] = useState<TacticalEvent[]>([]);
  const [goals, setGoalsData] = useState<GoalRecord[]>([]);
  const [reportPhotos, setReportPhotosData] = useState<Record<string, any[]>>({});
  const [dailySummaries, setDailySummariesData] = useState<Record<string, { summary: string; weather: string }>>({});
  const [drillCompletions, setDrillCompletionsData] = useState<Record<string, boolean>>({});
  const [teamPlans, setTeamPlans] = useState<Record<string, any>>({});
  const [drillCompletionsRaw, setDrillCompletionsRaw] = useState<any[]>([]);

  // Memoized Firebase References
  const schoolDocRef = useMemoFirebase(() => (user && db && isActive) ? doc(db, 'schools', user.uid) : null, [db, user, isActive]);
  const { data: schoolProfile, isLoading: schoolsLoading } = useDoc<SchoolProfile>(schoolDocRef);

  const playersQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(collection(db, 'players'), where('ownerId', '==', user.uid));
  }, [db, user, isActive]);
  const { data: allPlayers, isLoading: playersLoading } = useCollection<Player>(playersQuery);

  const incidentsQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(collection(db, 'all_health_incidents'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear));
  }, [db, user, selectedYear, isActive]);
  const { data: healthIncidents } = useCollection<HealthIncident>(incidentsQuery);

  const activitiesQuery = useMemoFirebase(() => {
    if (!user || !db || !isActive) return null;
    return query(collection(db, 'school_activities'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear));
  }, [db, user, selectedYear, isActive]);
  const { data: schoolActivities } = useCollection(activitiesQuery);

  const syncOfflineAttendance = useCallback(async () => {
    if (!user || !db || !navigator.onLine || syncLockRef.current) return;

    const queueStr = localStorage.getItem(OFFLINE_ATTENDANCE_KEY);
    if (!queueStr) return;

    const queue: AttendanceRecord = JSON.parse(queueStr);
    const keys = Object.keys(queue);
    if (keys.length === 0) return;

    syncLockRef.current = true;
    setIsSyncing(true);

    try {
      for (const key of keys) {
        const status = queue[key];
        const parts = key.split('_');
        if (parts.length < 3) continue;
        const [playerId, date, session] = parts;
        const attRef = doc(db, 'attendance_registry', `${playerId}_${date}_${session}`);
        
        if (!status) {
          deleteDocumentNonBlocking(attRef);
        } else {
          setDocumentNonBlocking(attRef, { 
            status, 
            playerId, 
            date, 
            session, 
            schoolId: user.uid, 
            academicYear: selectedYear 
          }, { merge: true });
        }
        delete queue[key];
      }
      localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(queue));
      setPendingCount(0);
    } catch (error) {
      console.warn("WGB: Offline sync failed, retry required.");
    } finally {
      setIsSyncing(false);
      syncLockRef.current = false;
    }
  }, [db, user, selectedYear]);

  // 2. Synchronization Effect
  useEffect(() => {
    if (!user || !db || !isActive) return;

    const handleSync = () => syncOfflineAttendance();
    window.addEventListener('online', handleSync);
    handleSync();

    const today = format(new Date(), 'yyyy-MM-dd');
    const unsubs = [
      onSnapshot(query(collection(db, 'attendance_registry'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const newAtt: AttendanceRecord = {};
        snapshot.docs.forEach(doc => {
          const d = doc.data();
          const sessionSuffix = d.session ? `_${d.session}` : '_Morning';
          newAtt[`${d.playerId}_${d.date}${sessionSuffix}`] = d.status;
        });
        const queueStr = localStorage.getItem(OFFLINE_ATTENDANCE_KEY);
        if (queueStr) {
          const queue = JSON.parse(queueStr);
          setAttendanceData({ ...newAtt, ...queue });
          setPendingCount(Object.keys(queue).length);
        } else {
          setAttendanceData(newAtt);
        }
      }),
      onSnapshot(query(collection(db, 'fitness_registry'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const latestMap: Record<string, FitnessAssessment> = {};
        const historyMap: Record<string, FitnessAssessment[]> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data() as FitnessAssessment;
          const pId = data.playerId;
          if (!pId) return;
          if (!latestMap[pId] || (data.updatedAt && latestMap[pId].updatedAt && new Date(data.updatedAt) > new Date(latestMap[pId].updatedAt!))) {
            latestMap[pId] = data;
          }
          if (!historyMap[pId]) historyMap[pId] = [];
          historyMap[pId].push({ ...data, date: data.date || data.updatedAt?.split('T')[0] });
        });
        setFitnessData(latestMap);
        setFitnessHistory(historyMap);
      }),
      onSnapshot(query(collection(db, 'skills_registry'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const skillsMap: Record<string, SportSkill> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data() as SportSkill;
          const pId = data.playerId;
          if (!pId) return;
          const key = `${pId}_${data.sportName}`;
          if (!skillsMap[key] || (data.lastUpdated && skillsMap[key].lastUpdated && new Date(data.lastUpdated) > new Date(skillsMap[key].lastUpdated!))) {
            skillsMap[key] = data;
          }
        });
        setSportSkillsData(skillsMap);
      }),
      onSnapshot(query(collection(db, 'readiness_registry'), where('schoolId', '==', user.uid), where('date', '==', today)), (snapshot) => {
        const map: Record<string, any> = {};
        snapshot.docs.forEach(doc => { 
          const d = doc.data(); 
          map[d.playerId] = d; 
        });
        setDailyReadinessData(map);
      }),
      onSnapshot(query(collection(db, 'tactical_registry'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const events: TacticalEvent[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TacticalEvent));
        setTacticalEventsData(events.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
      }),
      onSnapshot(query(collection(db, 'drill_completions'), where('schoolId', '==', user.uid)), (snapshot) => {
        const map: Record<string, boolean> = {};
        const rawList: any[] = [];
        snapshot.docs.forEach(doc => {
          map[doc.id] = true;
          rawList.push(doc.data());
        });
        setDrillCompletionsData(map);
        setDrillCompletionsRaw(rawList);
      }),

      onSnapshot(query(collection(db, 'game_rules_registry'), where('schoolId', '==', user.uid)), (snapshot) => {
        const rulesMap: Record<string, any> = {};
        snapshot.docs.forEach(doc => rulesMap[doc.id] = doc.data());
        setGameRulesData(rulesMap);
      }),
      onSnapshot(query(collection(db, 'exam_configs'), where('schoolId', '==', user.uid)), (snapshot) => {
        const configMap: Record<string, ExamLabels> = {};
        snapshot.docs.forEach(doc => configMap[doc.id] = doc.data().labels as ExamLabels);
        setExamConfigs(configMap);
      }),
      onSnapshot(query(collection(db, 'performance_configs'), where('schoolId', '==', user.uid)), (snapshot) => {
        const configMap: Record<string, PerformanceLabels> = {};
        snapshot.docs.forEach(doc => configMap[doc.id] = doc.data().labels as PerformanceLabels);
        setPerformanceConfigs(configMap);
      }),
      onSnapshot(query(collection(db, 'team_plans'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const plansMap: Record<string, any> = {};
        snapshot.docs.forEach(doc => {
          plansMap[doc.id] = doc.data();
        });
        setTeamPlans(plansMap);
      }),
      onSnapshot(query(collection(db, 'goal_registry'), where('schoolId', '==', user.uid), where('academicYear', '==', selectedYear)), (snapshot) => {
        const goalsList: GoalRecord[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as GoalRecord));
        setGoalsData(goalsList);
      }),
      onSnapshot(query(collection(db, 'report_photos'), where('schoolId', '==', user.uid)), (snapshot) => {
        const photosMap: Record<string, any[]> = {};
        snapshot.docs.forEach(doc => {
          const p = doc.data();
          const date = p.date;
          if (!date) return;
          if (!photosMap[date]) photosMap[date] = [];
          photosMap[date].push({ ...p, id: doc.id });
        });
        setReportPhotosData(photosMap);
      }),
      onSnapshot(query(collection(db, 'daily_summaries'), where('schoolId', '==', user.uid)), (snapshot) => {
        const summariesMap: Record<string, { summary: string; weather: string }> = {};
        snapshot.docs.forEach(doc => {
          const d = doc.data();
          if (d.date) summariesMap[d.date] = { summary: d.summary || '', weather: d.weather || 'Sunny' };
        });
        setDailySummariesData(summariesMap);
      })
    ];

    return () => {
      window.removeEventListener('online', handleSync);
      unsubs.forEach(unsub => unsub());
    };
  }, [db, user, selectedYear, syncOfflineAttendance, isActive]);

  // 3. Aggregated Data Memo
  const aggregatedData = useMemo(() => {
    const dbPlayers = allPlayers || [];
    const mergedPlayers = [...dbPlayers];

    return {
      players: mergedPlayers,
      attendance,
      fitness,
      fitnessHistory,
      sportSkills,
      skillsHistory,
      drillCompletions,
      drillCompletionsRaw,
      gameRules,
      examConfigs,
      performanceConfigs,
      dailyReadiness,
      tacticalEvents,
      goals,
      reportPhotos,
      dailySummaries,
      healthIncidents: healthIncidents || [],
      activities: schoolActivities || [],
      teamPlans,
      schoolProfile: schoolProfile || {
        schoolName: "शासकीय माध्यमिक आश्रम शाळा वाघंबा",
        teacherName: "Sunil Deshmukh",
        taluka: "Satana",
        district: "Nashik",
        id: "default",
        qualification: "B.P.Ed / M.P.Ed",
        role: "Physical Education Director",
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    };
  }, [allPlayers, healthIncidents, attendance, fitness, fitnessHistory, sportSkills, skillsHistory, gameRules, examConfigs, performanceConfigs, schoolProfile, dailyReadiness, tacticalEvents, goals, reportPhotos, dailySummaries, drillCompletions, drillCompletionsRaw, schoolActivities, teamPlans]);

  return {
    data: aggregatedData,
    isLoaded: !!db && !playersLoading && !schoolsLoading,
    selectedYear,
    setSelectedYear,
    pendingSyncCount: pendingCount,
    isSyncing,
    saveSchoolProfile: (profile: any) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'schools', user.uid), { ...profile, id: user.uid, ownerId: user.uid, updatedAt: new Date().toISOString() }, { merge: true }); },
    updatePasscode: (passcode: string) => { if (!user || !db) return; updateDocumentNonBlocking(doc(db, 'schools', user.uid), { passcode }); },
    addPlayer: (playerData: any) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'players', playerData.id), { ...playerData, ownerId: user.uid, schoolId: user.uid, academicYear: selectedYear }, { merge: true }); },
    updatePlayer: (player: any) => { if (!db || !user) return; setDocumentNonBlocking(doc(db, 'players', player.id), { ...player, ownerId: user.uid, schoolId: user.uid }, { merge: true }); },
    setTeamPlan: (sport: string, date: string, plan: any) => {
      if (!user || !db) return;
      const id = `${user.uid}_${sport}_${date}`;
      setDocumentNonBlocking(doc(db, 'team_plans', id), {
        ...plan,
        id,
        sport,
        date,
        schoolId: user.uid,
        academicYear: selectedYear,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    },
    deletePlayer: (playerId: string) => { if (!db) return; deleteDocumentNonBlocking(doc(db, 'players', playerId)); },
    addActivity: (act: any) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'school_activities', act.id), { ...act, schoolId: user.uid, academicYear: selectedYear }, { merge: true }); },
    deleteActivity: (id: string) => { if (!db) return; deleteDocumentNonBlocking(doc(db, 'school_activities', id)); },
    setAttendance: (newAttendance: AttendanceRecord) => {
      if (!user || !db) return;
      setAttendanceData(prev => ({ ...prev, ...newAttendance }));
      Object.entries(newAttendance).forEach(([key, status]) => {
        const parts = key.split('_');
        if (parts.length < 3) return;
        const [playerId, date, session] = parts;
        const attRef = doc(db, 'attendance_registry', `${playerId}_${date}_${session}`);
        if (!navigator.onLine) {
          const q = JSON.parse(localStorage.getItem(OFFLINE_ATTENDANCE_KEY) || '{}');
          q[key] = status;
          localStorage.setItem(OFFLINE_ATTENDANCE_KEY, JSON.stringify(q));
          setPendingCount(Object.keys(q).length);
        } else {
          if (!status) deleteDocumentNonBlocking(attRef);
          else setDocumentNonBlocking(attRef, { status, playerId, date, session, schoolId: user.uid, academicYear: selectedYear }, { merge: true });
        }
      });
    },
    setFitness: (playerId: string, assessment: FitnessAssessment) => { if (!user || !db) return; const dateId = assessment.month || new Date().toISOString().split('T')[0]; setDocumentNonBlocking(doc(db, 'fitness_registry', `${playerId}_${dateId}`), { ...assessment, playerId, schoolId: user.uid, date: dateId, updatedAt: new Date().toISOString(), academicYear: selectedYear }, { merge: true }); },
    setReadiness: (playerId: string, d: any) => { if (!user || !db) return; const dateId = new Date().toISOString().split('T')[0]; setDocumentNonBlocking(doc(db, 'readiness_registry', `${playerId}_${dateId}`), { ...d, playerId, schoolId: user.uid, date: dateId, timestamp: new Date().toISOString(), academicYear: selectedYear }, { merge: true }); },
    addTacticalEvent: (e: any) => { if (!user || !db) return; const id = Math.random().toString(36).substr(2, 9); setDocumentNonBlocking(doc(db, 'tactical_registry', id), { ...e, id, schoolId: user.uid, academicYear: selectedYear }, { merge: true }); },
    deleteTacticalEvent: (id: string) => { if (!db) return; deleteDocumentNonBlocking(doc(db, 'tactical_registry', id)); },
    setGoal: (g: any) => { if (!user || !db) return; const id = `${g.playerId}_${g.month}_${g.metric.replace(/\s+/g, '_')}`; setDocumentNonBlocking(doc(db, 'goal_registry', id), { ...g, id, schoolId: user.uid, academicYear: selectedYear }, { merge: true }); },
    deleteGoal: (id: string) => { if (!db) return; deleteDocumentNonBlocking(doc(db, 'goal_registry', id)); },
    saveDailySummary: (date: string, summary: string, weather: string) => {
      if (!user || !db) return;
      setDocumentNonBlocking(doc(db, 'daily_summaries', `${user.uid}_${date}`), {
        schoolId: user.uid,
        date,
        summary,
        weather,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    },
    saveReportPhoto: (photo: any) => {
      if (!user || !db) return;
      setDocumentNonBlocking(doc(db, 'report_photos', photo.id), {
        ...photo,
        schoolId: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    },
    deleteReportPhoto: (photoId: string) => {
      if (!db) return;
      deleteDocumentNonBlocking(doc(db, 'report_photos', photoId));
    },
    setExamLabels: (std: string, term: string, labels: ExamLabels) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'exam_configs', `${std}_${term}`), { labels, std, term, schoolId: user.uid, updatedAt: new Date().toISOString() }, { merge: true }); },
    setPerformanceLabels: (std: string, month: string, labels: PerformanceLabels) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'performance_configs', `${std}_${month}`), { labels, std, month, schoolId: user.uid, updatedAt: new Date().toISOString() }, { merge: true }); },
    setSportSkill: (pId: string, sport: string, skill: SportSkill) => { if (!user || !db) return; const timeId = new Date().getTime().toString(); setDocumentNonBlocking(doc(db, 'skills_registry', `${pId}_${sport}_${timeId}`), { ...skill, playerId: pId, sportName: sport, schoolId: user.uid, lastUpdated: new Date().toISOString(), academicYear: selectedYear }, { merge: true }); },
    setDrillCompletion: (dId: string, pId: string, comp: boolean, meta?: { sportName?: string; drillName?: string; gender?: string; std?: string }) => {
      if (!user || !db) return;
      const refId = `${pId}_${dId}`;
      if (comp) {
        setDocumentNonBlocking(doc(db, 'drill_completions', refId), {
          id: refId,
          schoolId: user.uid,
          playerId: pId,
          drillId: dId,
          sportName: meta?.sportName || dId.split('_')[0] || '',
          drillName: meta?.drillName || dId.split('_')[1] || '',
          gender: meta?.gender || '',
          std: meta?.std || '',
          timestamp: new Date().toISOString()
        }, { merge: true });
      } else {
        deleteDocumentNonBlocking(doc(db, 'drill_completions', refId));
      }
    },
    setGameRule: (s: string, pdf: string | null) => { if (!user || !db) return; if (!pdf) deleteDocumentNonBlocking(doc(db, 'game_rules_registry', s)); else setDocumentNonBlocking(doc(db, 'game_rules_registry', s), { sportName: s, pdfData: pdf, schoolId: user.uid, updatedAt: new Date().toISOString() }, { merge: true }); },
    addHealthIncident: (i: HealthIncident) => { if (!user || !db) return; setDocumentNonBlocking(doc(db, 'all_health_incidents', i.id), { ...i, schoolId: user.uid, academicYear: selectedYear }, { merge: true }); },
    deleteHealthIncident: (id: string) => { if (!db) return; deleteDocumentNonBlocking(doc(db, 'all_health_incidents', id)); },
    exportBackupData: () => {
      const data = {
        data: aggregatedData,
        exportedAt: new Date().toISOString(),
        version: "6.0.0"
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WGB_Registry_Backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
    },
    importBackupData: async (b: any) => {
      if (!user || !db || !b.data) return;
      const { data } = b;
      if (data.schoolProfile) setDocumentNonBlocking(doc(db, 'schools', user.uid), { ...data.schoolProfile, id: user.uid, ownerId: user.uid }, { merge: true });
      if (Array.isArray(data.players)) data.players.forEach((p: any) => setDocumentNonBlocking(doc(db, 'players', p.id), { ...p, ownerId: user.uid, schoolId: user.uid }, { merge: true }));
    },
    autoFixAllMarathiNames: async (): Promise<number> => {
      if (!user || !db) return 0;
      let updatedCount = 0;
      const players = aggregatedData.players || [];
      for (const player of players) {
        const guessed = guessMarathiName(player.name);
        const currentMarathi = (player.nameMarathi || '').trim();
        // If missing or non-devanagari or empty, update it
        if (!currentMarathi || !/[\u0900-\u097F]/.test(currentMarathi) || currentMarathi === player.name) {
          if (guessed && guessed !== currentMarathi) {
            setDocumentNonBlocking(
              doc(db, 'players', player.id),
              { ...player, nameMarathi: guessed, ownerId: user.uid, schoolId: user.uid },
              { merge: true }
            );
            updatedCount++;
          }
        }
      }
      return updatedCount;
    },
    syncOfflineAttendance
  };
}