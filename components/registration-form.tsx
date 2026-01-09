"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import ErrorModal from "@/components/error-modal"

const DEFAULT_REFERRAL_ID = "108054" //  Layanna Kristina Chagas Araujo Faustino

const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]

const PLANS = {
  VIVO: [
    { id: "178", name: "40GB COM LIGACAO", price: 49.9, esim: true },
    { id: "69", name: "80GB COM LIGACAO", price: 69.9, esim: true },
    { id: "61", name: "150GB COM LIGACAO", price: 99.9, esim: true },
  ],
  TIM: [
    { id: "56", name: "100GB COM LIGACAO", price: 69.9, esim: true },
    { id: "154", name: "200GB SEM LIGAÇÃO", price: 159.9, esim: true },
    { id: "155", name: "300GB SEM LIGAÇÃO", price: 199.9, esim: true },
  ],
  CLARO: [
    { id: "57", name: "80GB COM LIGACAO", price: 69.9, esim: true },
    { id: "183", name: "150GB COM LIGACAO", price: 99.9, esim: true },
  ],
}

interface Representante {
  id: string
  nome: string
  whatsapp: string
}

interface RegistrationFormProps {
  representante?: Representante
}

export default function RegistrationForm({ representante }: RegistrationFormProps) {
  const REFERRAL_ID = representante?.id || DEFAULT_REFERRAL_ID

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [billingId, setBillingId] = useState<string>("")
  const [orderAmount, setOrderAmount] = useState<number>(0)
  const [cpfValidated, setCpfValidated] = useState(false)
  const [emailValidated, setEmailValidated] = useState(false)
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [cepValid, setCepValid] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    cpf: "",
    birth: "",
    name: "",
    email: "",
    cell: "",
    cep: "",
    district: "",
    city: "",
    state: "",
    street: "",
    number: "",
    complement: "",
    typeChip: "",
    coupon: "",
    plan_id: "",
    typeFrete: "",
  })

  // Estados para controle visual de preenchimento sequencial
  const [activeField, setActiveField] = useState<string>("typeChip")
  const [birthValid, setBirthValid] = useState<boolean | null>(null)
  const [whatsappValid, setWhatsappValid] = useState<boolean | null>(null)
  const [whatsappValidating, setWhatsappValidating] = useState(false)

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d{0,3})/, "$1-$2")
  }

  const formatDateInput = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) {
      return numbers
    }
    if (numbers.length <= 4) {
      return numbers.replace(/(\d{2})(\d{0,2})/, "$1/$2")
    }
    return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3")
  }

  const convertDateToISO = (dateStr: string): string => {
    const numbers = dateStr.replace(/\D/g, "")
    if (numbers.length !== 8) return ""

    const day = numbers.substring(0, 2)
    const month = numbers.substring(2, 4)
    const year = numbers.substring(4, 8)

    return `${year}-${month}-${day}`
  }

  const convertDateFromISO = (isoDate: string): string => {
    if (!isoDate) return ""
    const [year, month, day] = isoDate.split("-")
    return `${day}/${month}/${year}`
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === "cpf") {
      formattedValue = formatCPF(value)
    } else if (field === "cell") {
      formattedValue = formatPhone(value)
    } else if (field === "birth") {
      formattedValue = formatDateInput(value)
      // Validar formato visual da data
      const numbers = value.replace(/\D/g, "")
      if (numbers.length === 8) {
        setBirthValid(true)
        checkFieldCompletion(field, formattedValue)
      } else {
        setBirthValid(numbers.length > 0 ? false : null)
      }
    } else if (field === "cep") {
      formattedValue = formatCEP(value)
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }))

    // Verificar se o campo foi preenchido corretamente e liberar o próximo
    if (field !== "birth") {
      checkFieldCompletion(field, formattedValue)
    }
  }

  // Validar WhatsApp via wa.me
  const validateWhatsApp = async (phone: string) => {
    const numbers = phone.replace(/\D/g, "")

    if (numbers.length < 10 || numbers.length > 11) {
      setWhatsappValid(false)
      return
    }

    setWhatsappValidating(true)

    try {
      const waNumber = `55${numbers}`

      const response = await fetch('https://webhook.fiqon.app/webhook/019b97c2-6aed-7162-8a3a-1fd63694ecd6/5fb591d0-1499-4928-9b9f-198abec46afe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat: {
            phone: waNumber
          }
        })
      })

      const data = await response.json()

      if (data.existe === true) {
        setWhatsappValid(true)
        checkFieldCompletion("cell", phone)
      } else {
        setWhatsappValid(false)
        toast({
          title: "WhatsApp inválido",
          description: "O número informado não possui WhatsApp. Por favor, verifique.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Erro ao validar WhatsApp:', error)
      setWhatsappValid(false)
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar o WhatsApp. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setWhatsappValidating(false)
    }
  }

  // Verificar se campo está completo e liberar próximo
  const checkFieldCompletion = (field: string, value: string) => {
    const fieldOrder = [
      "typeChip",
      "plan_id",
      "cpf",
      "birth",
      "name",
      "email",
      "cell",
      "cep",
      "district",
      "city",
      "state",
      "street",
      "number",
      "complement",
      "typeFrete"
    ]

    const currentIndex = fieldOrder.indexOf(field)
    if (currentIndex === -1) return

    let isValid = false

    switch (field) {
      case "typeChip":
        isValid = value === "fisico" || value === "eSim"
        break
      case "plan_id":
        isValid = value !== ""
        break
      case "cpf":
        isValid = value.replace(/\D/g, "").length === 11
        break
      case "birth":
        isValid = value.replace(/\D/g, "").length === 8
        break
      case "name":
        isValid = value.trim().length > 3
        break
      case "email":
        isValid = value.includes("@") && value.includes(".")
        break
      case "cell":
        const numbers = value.replace(/\D/g, "")
        isValid = numbers.length >= 10 && numbers.length <= 11
        break
      case "cep":
        isValid = value.replace(/\D/g, "").length === 8
        // Quando o CEP for válido, liberar TODOS os campos de endereço de uma vez
        if (isValid) {
          setActiveField("complement")
          return
        }
        break
      case "district":
      case "city":
      case "street":
        isValid = value.trim().length > 0
        break
      case "state":
        isValid = value !== ""
        break
      case "number":
      case "complement":
        isValid = true // Campos opcionais
        break
      case "typeFrete":
        isValid = value !== ""
        break
    }

    if (isValid && currentIndex < fieldOrder.length - 1) {
      setActiveField(fieldOrder[currentIndex + 1])
    }

    // Verificar se todos os campos de endereço obrigatórios estão preenchidos para liberar typeFrete
    if (["district", "city", "state", "street"].includes(field)) {
      if (formData.district.trim().length > 0 &&
          formData.city.trim().length > 0 &&
          formData.state !== "" &&
          formData.street.trim().length > 0) {
        setActiveField("typeFrete")
      }
    }
  }

  // Verificar se um campo pode ser interagido
  const isFieldUnlocked = (fieldName: string): boolean => {
    const fieldOrder = [
      "typeChip",
      "plan_id",
      "cpf",
      "birth",
      "name",
      "email",
      "cell",
      "cep",
      "district",
      "city",
      "state",
      "street",
      "number",
      "complement",
      "typeFrete"
    ]

    const currentIndex = fieldOrder.indexOf(activeField)
    const targetIndex = fieldOrder.indexOf(fieldName)

    return targetIndex <= currentIndex
  }

  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "")
    if (cleanCEP.length !== 8) {
      setCepValid(null)
      return
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setCepValid(true)
        setFormData((prev) => ({
          ...prev,
          street: data.logradouro || "",
          district: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }))
      } else {
        setCepValid(false)
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
      setCepValid(false)
    }
  }

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, "")
    if (cleanCPF.length !== 11) return false

    // Validação básica de CPF
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false

    let sum = 0
    let remainder

    for (let i = 1; i <= 9; i++) {
      sum += Number.parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cleanCPF.substring(9, 10))) return false

    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum += Number.parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cleanCPF.substring(10, 11))) return false

    return true
  }

  const validateCPFWithAPI = async (cpf: string, birthDisplay: string) => {
    const cleanCPF = cpf.replace(/\D/g, "")
    const birthISO = convertDateToISO(birthDisplay)
    if (cleanCPF.length !== 11 || !birthISO) return

    try {
      const [year, month, day] = birthISO.split("-")
      const formattedBirth = `${day}-${month}-${year}`

      const response = await fetch(
        `https://apicpf.whatsgps.com.br/api/cpf/search?numeroDeCpf=${cleanCPF}&dataNascimento=${formattedBirth}&token=2|VL3z6OcyARWRoaEniPyoHJpPtxWcD99NN2oueGGn4acc0395`,
      )
      const data = await response.json()

      if (data.data && data.data.id) {
        const autoFilledName = data.data.nome_da_pf || ""
        setFormData((prev) => ({
          ...prev,
          name: autoFilledName,
        }))
        setCpfValidated(true)

        if (autoFilledName.trim().length > 3) {
          setActiveField("email")
        }

        toast({
          title: "CPF validado!",
          description: "Dados preenchidos automaticamente.",
        })
      } else {
        setActiveField("name")
        toast({
          title: "CPF não encontrado",
          description: "Verifique o CPF e data de nascimento.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao validar CPF:", error)
      setActiveField("name")
    }
  }

  const validateEmail = async (email: string) => {
    if (!email) return

    try {
      const response = await fetch(`https://federalassociados.com.br/getEmail/${email}`)
      const data = await response.json()

      if (data.status === "success") {
        setEmailValidated(true)
        toast({
          title: "Email validado!",
          description: "Email confirmado com sucesso.",
        })
      } else if (data.status === "error") {
        toast({
          title: "Erro",
          description: data.msg || "Email já cadastrado ou inválido.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao validar email:", error)
    }
  }

  const validateCoupon = async (coupon: string) => {
    if (!coupon) return

    try {
      const response = await fetch(`https://federalassociados.com.br/getValidateCoupon/${coupon}`)
      const data = await response.json()

      if (data.status === "success") {
        toast({
          title: "Cupom válido!",
          description: data.msg || "Cupom aplicado com sucesso.",
        })
      } else if (data.status === "error") {
        toast({
          title: "Cupom inválido",
          description: data.msg || "Verifique o código do cupom.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao validar cupom:", error)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validações
    if (!validateCPF(formData.cpf)) {
      setErrorMessage("CPF inválido! Por favor, verifique o CPF informado.")
      setShowErrorModal(true)
      setLoading(false)
      return
    }

    if (cepValid === false) {
      setErrorMessage("CEP inválido! Por favor, verifique o CEP informado e corrija antes de continuar.")
      setShowErrorModal(true)
      setLoading(false)
      return
    }

    if (!formData.plan_id) {
      setErrorMessage("Por favor, selecione um plano antes de continuar.")
      setShowErrorModal(true)
      setLoading(false)
      return
    }

    if (!formData.typeFrete) {
      setErrorMessage("Por favor, selecione a forma de envio antes de continuar.")
      setShowErrorModal(true)
      setLoading(false)
      return
    }

    try {
      // Preparar dados CONVERTIDOS para o webhook
      const selectedPlan = Object.values(PLANS).flat().find(plan => plan.id === formData.plan_id)
      let planName = 'Plano não identificado'

      if (selectedPlan) {
        const operator = Object.keys(PLANS).find(key =>
          PLANS[key as keyof typeof PLANS].some(p => p.id === formData.plan_id)
        )
        planName = `${operator} - ${selectedPlan.name}`
      }

      let formaEnvio = ''
      if (formData.typeFrete === 'Carta') {
        formaEnvio = 'Carta Registrada'
      } else if (formData.typeFrete === 'semFrete') {
        formaEnvio = 'Retirar na Associação'
      } else if (formData.typeFrete === 'eSim') {
        formaEnvio = 'e-SIM'
      }

      const webhookData = {
        nome: formData.name,
        cpf: formData.cpf,
        data_nascimento: formData.birth,
        email: formData.email,
        whatsapp: formData.cell,
        telefone_fixo: "",
        plano: planName,
        plan_id: formData.plan_id,
        tipo_chip: formData.typeChip === 'fisico' ? 'Físico' : 'e-SIM',
        forma_envio: formaEnvio,
        cep: formData.cep,
        endereco: formData.street,
        numero: formData.number,
        complemento: formData.complement,
        bairro: formData.district,
        cidade: formData.city,
        estado: formData.state,
        referral_id: REFERRAL_ID
      }

      // Mapear webhook URL por representante
      const webhookURLs: { [key: string]: string } = {
        '108054': 'https://webhook.fiqon.app/webhook/019b9b3f-4c25-7378-97f3-27329fcef7d1/50b76f62-30b6-431b-bbf4-cd5739412da3',
      }

      const webhookURL = webhookURLs[REFERRAL_ID]

      if (!webhookURL) {
        setErrorMessage('Representante não encontrado. Favor verificar.')
        setShowErrorModal(true)
        setLoading(false)
        return
      }

      // Criar AbortController para timeout de 20 segundos
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 segundos

      try {
        // Enviar dados APENAS para o Webhook e aguardar resposta
        const response = await fetch(webhookURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        console.log('[FiQOn] HTTP Status:', response.status)
        console.log('[FiQOn] Response OK:', response.ok)

        // Obter texto da resposta
        const responseText = await response.text()
        console.log('[FiQOn] Resposta bruta:', responseText)

        // Variável para armazenar a mensagem final
        let webhookMessage = ''

        // Tentar parsear como JSON primeiro
        try {
          const responseData = JSON.parse(responseText)
          console.log('[FiQOn] Resposta parseada como JSON:', responseData)

          // Extrair mensagem do JSON (conforme $7.body.message do FiQOn)
          webhookMessage = responseData.message || responseData.msg || responseData.mensagem || ''
        } catch (parseError) {
          // Se não for JSON, usar o texto puro como mensagem
          console.log('[FiQOn] Resposta não é JSON, usando texto puro')
          webhookMessage = responseText.trim()
        }

        console.log('[FiQOn] Mensagem final capturada:', webhookMessage)

        // Se temos uma mensagem, exibir para o usuário
        if (webhookMessage) {
          // Verificar se é erro (geralmente contém palavras-chave de erro)
          const lowerMessage = webhookMessage.toLowerCase()
          const isError = lowerMessage.includes('erro') ||
                         lowerMessage.includes('já') ||
                         lowerMessage.includes('inválido') ||
                         lowerMessage.includes('falha') ||
                         lowerMessage.includes('não') ||
                         lowerMessage.includes('sendo utilizado') ||
                         !response.ok

          if (isError) {
            // Exibir mensagem de erro retornada pelo webhook
            setErrorMessage(webhookMessage)
            setShowErrorModal(true)
            setLoading(false)
            return
          }

          // Se sucesso, exibir mensagem de sucesso
          setSuccessMessage(webhookMessage)
          setLoading(false)
          setShowSuccessModal(true)
          return
        }

        // Se não houver mensagem mas resposta for OK, sucesso genérico
        if (response.ok) {
          setSuccessMessage('Cadastro realizado com sucesso!')
          setLoading(false)
          setShowSuccessModal(true)
          return
        }

        // Se não houver mensagem e não for ok, erro genérico
        setErrorMessage('Erro ao processar cadastro. Tente novamente.')
        setShowErrorModal(true)
        setLoading(false)

      } catch (fetchError: any) {
        clearTimeout(timeoutId)

        if (fetchError.name === 'AbortError') {
          setErrorMessage('Tempo limite excedido. O servidor está demorando para responder. Tente novamente.')
          setShowErrorModal(true)
          setLoading(false)
          return
        }

        throw fetchError
      }

    } catch (error) {
      console.error('Erro ao processar cadastro:', error)
      setErrorMessage('Não foi possível completar o cadastro. Verifique sua conexão e tente novamente.')
      setShowErrorModal(true)
      setLoading(false)
    }
  }

  const getAvailablePlans = () => {
    if (formData.typeChip === "eSim") {
      return Object.entries(PLANS)
        .flat()
        .filter((plan) => plan.esim)
    }
    return Object.values(PLANS).flat()
  }

  useEffect(() => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.src = 'https://myehbxfidszreorsaexi.supabase.co/storage/v1/object/public/adesao/adesao.mp4'
    video.load()
  }, [])

  // Monitorar campos de endereço e liberar typeFrete quando todos estiverem preenchidos
  useEffect(() => {
    if (activeField === "complement" ||
        (formData.district.trim().length > 0 &&
         formData.city.trim().length > 0 &&
         formData.state !== "" &&
         formData.street.trim().length > 0)) {
      if (formData.district.trim().length > 0 &&
          formData.city.trim().length > 0 &&
          formData.state !== "" &&
          formData.street.trim().length > 0 &&
          activeField !== "typeFrete") {
        setActiveField("typeFrete")
      }
    }
  }, [formData.district, formData.city, formData.state, formData.street, activeField])

  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg p-6 mx-auto max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
            Parabéns! Seu cadastro foi realizado com sucesso. 🎉
          </h1>

          <div className="space-y-3 text-gray-700 text-sm md:text-base leading-relaxed">
            <p>
              Para darmos continuidade com à ativação do seu plano, é necessário realizar o pagamento da sua taxa associativa, no valor proporcional ao plano escolhido por você.
            </p>

            <p>
              Essa taxa é solicitada antes da ativação, pois ela confirma oficialmente a sua entrada na Federal Associados.
            </p>

            <p className="font-semibold">
              O valor é usado para cobrir os custos administrativos e operacionais, como:
            </p>

            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>Geração do número.</li>
              <li>Configuração da linha.</li>
              <li>Liberação do seu escritório virtual.</li>
              <li>E acesso a todos os benefícios exclusivos da empresa, como o Clube de Descontos, Cinema Grátis, Programa PBI, entre outros.</li>
            </ul>

            <p>
              O pagamento da taxa é o primeiro passo para liberar o seu benefício de internet móvel e garantir sua ativação com total segurança.
            </p>

            <p>
              Logo após efetuar o pagamento, você receberá um e-mail para fazer a biometria digital.
            </p>

            <p className="font-semibold">
              Após isso já partimos para ativação do seu plano.
            </p>

            <p className="text-center font-bold text-base md:text-lg mt-4">
              Clique no botão abaixo para continuar:
            </p>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={() => window.location.href = "https://federalassociados.com.br/boletos"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base md:text-lg font-semibold rounded-lg shadow-lg transition-colors"
            >
              Realizar Adesão
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Plano e Chip */}
        <Card>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Escolha seu Plano</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Chip</Label>
                <RadioGroup
                  value={formData.typeChip}
                  onValueChange={(value) => {
                    handleInputChange("typeChip", value)
                    handleInputChange("plan_id", "")
                  }}
                  className="flex gap-4"
                  disabled={!isFieldUnlocked("typeChip")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fisico" id="fisico" disabled={!isFieldUnlocked("typeChip")} />
                    <Label htmlFor="fisico" className="font-normal cursor-pointer">
                      Físico
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="eSim" id="eSim-chip" disabled={!isFieldUnlocked("typeChip")} />
                    <Label htmlFor="eSim-chip" className="font-normal cursor-pointer">
                      e-SIM
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className={`space-y-2 ${!isFieldUnlocked("plan_id") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="plan">
                  Plano <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.plan_id}
                  onValueChange={(value) => handleInputChange("plan_id", value)}
                  required
                  disabled={!isFieldUnlocked("plan_id")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-sm font-semibold pointer-events-none" style={{ color: '#8B5CF6' }}>VIVO</div>
                    {PLANS.VIVO.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} className="text-gray-900 font-medium">
                        {plan.name} - R$ {plan.price.toFixed(2).replace('.', ',')}
                      </SelectItem>
                    ))}

                    <div className="px-2 py-1.5 text-sm font-semibold mt-2 pointer-events-none" style={{ color: '#1E90FF' }}>TIM</div>
                    {PLANS.TIM.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} className="text-gray-900 font-medium">
                        {plan.name} - R$ {plan.price.toFixed(2).replace('.', ',')}
                      </SelectItem>
                    ))}

                    <div className="px-2 py-1.5 text-sm font-semibold mt-2 pointer-events-none" style={{ color: '#DC143C' }}>CLARO</div>
                    {PLANS.CLARO.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} className="text-gray-900 font-medium">
                        {plan.name} - R$ {plan.price.toFixed(2).replace('.', ',')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Dados Pessoais */}
        <Card>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4">
              <div className={`space-y-2 ${!isFieldUnlocked("cpf") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="cpf">
                  CPF <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                  disabled={!isFieldUnlocked("cpf")}
                  className={cpfValidated ? "border-green-500" : ""}
                />
              </div>

              <div className={`space-y-2 ${!isFieldUnlocked("birth") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="birth">
                  Data de Nascimento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birth"
                  type="text"
                  value={formData.birth}
                  onChange={(e) => handleInputChange("birth", e.target.value)}
                  onBlur={(e) => validateCPFWithAPI(formData.cpf, e.target.value)}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  required
                  disabled={!isFieldUnlocked("birth")}
                  className={birthValid === false ? "border-red-500 border-2" : birthValid === true ? "border-green-500" : ""}
                />
                {birthValid === false && (
                  <p className="text-sm text-red-500 font-medium">Data incompleta! Digite no formato DD/MM/AAAA (8 dígitos).</p>
                )}
              </div>

              <div className={`space-y-2 md:col-span-2 lg:col-span-1 ${!isFieldUnlocked("name") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="name">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  readOnly={cpfValidated}
                  disabled={!isFieldUnlocked("name")}
                  className={cpfValidated ? "border-green-500" : ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Contato</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4">
              <div className={`space-y-2 md:col-span-2 ${!isFieldUnlocked("email") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={!isFieldUnlocked("email")}
                  className={emailValidated ? "border-green-500" : ""}
                />
              </div>

              <div className={`space-y-2 ${!isFieldUnlocked("cell") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="cell">
                  WhatsApp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cell"
                  value={formData.cell}
                  onChange={(e) => handleInputChange("cell", e.target.value)}
                  onBlur={(e) => {
                    const numbers = e.target.value.replace(/\D/g, "")
                    if (numbers.length >= 10 && numbers.length <= 11) {
                      validateWhatsApp(e.target.value)
                    } else if (numbers.length > 0) {
                      setWhatsappValid(false)
                    }
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  required
                  disabled={!isFieldUnlocked("cell")}
                  className={
                    whatsappValid === false
                      ? "border-red-500 border-2"
                      : whatsappValid === true
                      ? "border-green-500"
                      : ""
                  }
                />
                {whatsappValidating && (
                  <p className="text-sm text-blue-600 font-medium">Validando WhatsApp...</p>
                )}
                {whatsappValid === false && !whatsappValidating && (
                  <p className="text-sm text-red-500 font-medium">WhatsApp inválido! Verifique o número digitado.</p>
                )}
                {whatsappValid === true && (
                  <p className="text-sm text-green-600 font-medium">WhatsApp válido</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
              <div className={`space-y-2 ${!isFieldUnlocked("cep") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="cep">
                  CEP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => {
                    handleInputChange("cep", e.target.value)
                    setCepValid(null)
                  }}
                  onBlur={(e) => fetchAddressByCEP(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  required
                  disabled={!isFieldUnlocked("cep")}
                  className={cepValid === false ? "border-red-500 border-2" : cepValid === true ? "border-green-500" : ""}
                />
                {cepValid === false && (
                  <p className="text-sm text-red-500 font-medium">CEP inválido! Verifique o número digitado.</p>
                )}
              </div>

              <div className={`space-y-2 ${!isFieldUnlocked("district") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="district">
                  Bairro <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  placeholder="Seu bairro"
                  required
                  disabled={!isFieldUnlocked("district")}
                />
              </div>

              <div className={`space-y-2 ${!isFieldUnlocked("city") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="city">
                  Cidade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Sua cidade"
                  required
                  disabled={!isFieldUnlocked("city")}
                />
              </div>

              <div className={`space-y-2 ${!isFieldUnlocked("state") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="state">
                  Estado <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleInputChange("state", value)}
                  required
                  disabled={!isFieldUnlocked("state")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={`space-y-2 md:col-span-2 lg:col-span-3 ${!isFieldUnlocked("street") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="street">
                  Endereço <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  placeholder="Rua, Avenida, etc"
                  required
                  disabled={!isFieldUnlocked("street")}
                />
              </div>

              <div className={`space-y-2 ${!isFieldUnlocked("number") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => handleInputChange("number", e.target.value)}
                  placeholder="123"
                  disabled={!isFieldUnlocked("number")}
                />
              </div>

              <div className={`space-y-2 md:col-span-2 ${!isFieldUnlocked("complement") ? "opacity-50 pointer-events-none" : ""}`}>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.complement}
                  onChange={(e) => handleInputChange("complement", e.target.value)}
                  placeholder="Apto, Bloco, etc"
                  disabled={!isFieldUnlocked("complement")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forma de Envio */}
        <Card>
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Forma de Envio</h2>
            <div className={!isFieldUnlocked("typeFrete") ? "opacity-50 pointer-events-none" : ""}>
              <RadioGroup
                value={formData.typeFrete}
                onValueChange={(value) => handleInputChange("typeFrete", value)}
                className="space-y-3"
                disabled={!isFieldUnlocked("typeFrete")}
              >
                {formData.typeChip === "fisico" && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Carta" id="carta" disabled={!isFieldUnlocked("typeFrete")} />
                        <Label htmlFor="carta" className="font-normal cursor-pointer">
                          Enviar via Carta Registrada
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        Para quem vai receber o chip pelos Correios
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="semFrete" id="semFrete" disabled={!isFieldUnlocked("typeFrete")} />
                        <Label htmlFor="semFrete" className="font-normal cursor-pointer">
                          Retirar na Associação ou com um Associado
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        Se você vai retirar o chip pessoalmente com um representante ou no caso dos planos da Vivo, vai comprar um chip para ativar de forma imediata
                      </p>
                    </div>
                  </>
                )}
                {formData.typeChip === "eSim" && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="eSim" id="eSim" disabled={!isFieldUnlocked("typeFrete")} />
                    <Label htmlFor="eSim" className="font-normal cursor-pointer">
                      Sem a necessidade de envio (e-SIM)
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Voltar
          </Button>
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? "Processando..." : "Salvar"}
          </Button>
        </div>

        {/* Descrição do pagamento */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700 text-center">
            Ao clicar no botão, você será redirecionado para a área de pagamento da taxa associativa, sendo ela o valor proporcional ao plano escolhido por você.
          </p>
        </div>
      </form>

      <ErrorModal open={showErrorModal} onOpenChange={setShowErrorModal} message={errorMessage} />
    </>
  )
}
