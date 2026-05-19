import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaStethoscope, FaSearch } from 'react-icons/fa'

const SymptomChecker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)

  const commonSymptoms = [
    'Fever', 'Cough', 'Headache', 'Sore Throat', 'Runny Nose',
    'Body Ache', 'Fatigue', 'Nausea', 'Vomiting', 'Diarrhea',
    'Chest Pain', 'Shortness of Breath', 'Dizziness', 'Skin Rash',
    'Abdominal Pain', 'Back Pain', 'Joint Pain'
  ]

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom))
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
  }

  const checkSymptoms = () => {
    // Simple symptom checker logic
    if (selectedSymptoms.length === 0) {
      return
    }

    const hasFever = selectedSymptoms.includes('Fever')
    const hasCough = selectedSymptoms.includes('Cough')
    const hasHeadache = selectedSymptoms.includes('Headache')

    let possibleCondition = ''
    let specialization = ''
    let urgency = 'Low'

    if (hasFever && hasCough) {
      possibleCondition = 'Possible Flu or Respiratory Infection'
      specialization = 'General Physician'
      urgency = 'Medium'
    } else if (hasHeadache && selectedSymptoms.includes('Fever')) {
      possibleCondition = 'Possible Viral Infection'
      specialization = 'General Physician'
      urgency = 'Medium'
    } else if (selectedSymptoms.includes('Chest Pain')) {
      possibleCondition = 'Chest Pain - Requires Immediate Attention'
      specialization = 'Cardiologist'
      urgency = 'High'
    } else {
      possibleCondition = 'Common Cold or Minor Ailment'
      specialization = 'General Physician'
      urgency = 'Low'
    }

    setResult({
      condition: possibleCondition,
      specialization,
      urgency
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <FaStethoscope className="mx-auto text-primary-600 mb-4" size={64} />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Symptom Checker</h1>
          <p className="text-xl text-gray-600">
            Select your symptoms to get preliminary health information
          </p>
          <p className="text-sm text-red-600 mt-2">
            ⚠️ This is not a diagnosis. Please consult a doctor for proper medical advice.
          </p>
        </motion.div>

        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Your Symptoms</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonSymptoms.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedSymptoms.includes(symptom)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>

          {selectedSymptoms.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Selected Symptoms:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                  <span key={symptom} className="badge badge-info">
                    {symptom}
                  </span>
                ))}
              </div>
              <button
                onClick={checkSymptoms}
                className="btn-primary mt-4 flex items-center space-x-2"
              >
                <FaSearch />
                <span>Check Symptoms</span>
              </button>
            </div>
          )}
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Preliminary Results</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Possible Condition</p>
                <p className="text-lg font-semibold text-gray-800">{result.condition}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Recommended Specialist</p>
                <p className="text-lg font-semibold text-gray-800">{result.specialization}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Urgency Level</p>
                <span className={`inline-block px-4 py-2 rounded-full font-semibold ${
                  result.urgency === 'High' ? 'bg-red-100 text-red-800' :
                  result.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {result.urgency}
                </span>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Recommendation:</strong> Based on your symptoms, we recommend consulting a {result.specialization}. 
                  Please book an appointment for proper diagnosis and treatment.
                </p>
              </div>

              <button
                onClick={() => window.location.href = '/doctors'}
                className="btn-primary w-full mt-4"
              >
                Find {result.specialization}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SymptomChecker