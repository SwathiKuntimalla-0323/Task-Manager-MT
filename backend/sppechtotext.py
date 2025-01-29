import speech_recognition as sr
import pyttsx3

# Create a recognizer instance
r = sr.Recognizer()

def record_text():
    try:
        with sr.Microphone() as source2:
            print("Adjusting for ambient noise... Please wait.")
            r.adjust_for_ambient_noise(source2, duration=1.2)  
            print("Recording... Speak now.")
            audio2 = r.listen(source2)
            print("Processing your speech...")
            MyText = r.recognize_google(audio2)  
            print("You said:", MyText)
            return MyText
    except sr.RequestError as e:
        print("Could not request results; {0}".format(e))
    except sr.UnknownValueError:  
        print("Could not understand the audio. Please try again.")
    return None  

def output_text(text):
    with open("output.txt", "a") as f: 
        f.write(text + "\n")
    return

while True:
    text = record_text()
    if text:  
        output_text(text)
        print("Text saved to output.txt")
