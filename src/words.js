export const wordList = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", 
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", 
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", 
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", 
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", 
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", 
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", 
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", 
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", 
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", 
  "is", "are", "was", "were", "been", "being", "have", "has", "had", "do", 
  "does", "did", "can", "could", "shall", "should", "will", "would", "may", "might", 
  "must", "ought", "need", "dare", "always", "never", "sometimes", "often", "usually", "rarely", 
  "seldom", "frequently", "occasionally", "constantly", "continually", "beautiful", "wonderful", "amazing", "incredible", "fantastic", 
  "fabulous", "gorgeous", "stunning", "spectacular", "breathtaking", "awesome", "perfect", "excellent", "superb", "brilliant", 
  "outstanding", "magnificent", "marvelous", "splendid", "glorious", "great", "good", "nice", "fine", "lovely", 
  "pleasant", "charming", "delightful", "appealing", "attractive", "fascinating", "interesting", "captivating", "enchanting", "compelling", 
  "engaging", "absorbing", "gripping", "thrilling", "exciting", "exhilarating", "stimulating", "inspiring", "uplifting", "encouraging"
];

export const generateWords = (count = 50) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    result.push({ original: wordList[randomIndex], typed: "" });
  }
  return result;
};
