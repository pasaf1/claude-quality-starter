import 'dotenv/config';
import { supabase } from './lib/supabaseClient.js';

(async () => {
  // 1. הוספת רשומה חדשה
  const { data: insertData, error: insertError } = await supabase
    .from('tasks')
    .insert([{ title: '💡 Test via JS' }])      // הדגמת insert
    .select();                                  // מחזיר את הרשומה שהוכנסה :contentReference[oaicite:2]{index=2}

  if (insertError) {
    console.error('Insert error:', insertError);
  } else {
    console.log('Inserted:', insertData);
  }

  // 2. שליפת כל הרשומות
  const { data: tasks, error: selectError } = await supabase
    .from('tasks')
    .select('*');

  if (selectError) {
    console.error('Select error:', selectError);
  } else {
    console.log('Tasks:', tasks);
  }
})();
