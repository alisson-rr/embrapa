import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import matplotlib.pyplot as plt
def configurar_plots():
    plt.rcParams['figure.figsize'] = [10, 6]
    plt.rcParams['font.size'] = 12

####Variaveis obtidas pelo Questionário

#Sociais
#S=int(input()) # Anos de estudo do fazendeiro 1
#IN=int(input()) #Idade do membro mais jovem da família trabalhando na fazenda
#IV=int(input()) #Idade do membro mais velho da família trabalhando na fazenda
#JA=IN/IV #Job atractiveness (Idade do membro mais jovem da família trabalhando na fazenda/idade do membro mais velho trabalhando na fazenda) 2
#HP=int(input()) #Sim, ou não(1,0). Oferece plano de saúde aos funcionários 3 
#PS=int(input()) #Sim, ou não(1,0).O fazendeiro oferece compartilhamento de lucros para os funcionários 4
#TC = P1 + 2*P2 + 2*P3 numero de cursos operacionais+2*num de cursos tecnicos+3*número de cursos especializantes
#JQ= (Número de funcionários permanentes/Número de funcionários temporários+1)/(Número de funcionários temporários+1)

Anos_de_estudo= ctrl.Antecedent(np.arange(0,21,1),'Anos_de_estudo')
plano_saude = ctrl.Antecedent(np.arange(0, 1.1, 0.1), 'plano_saude')
compartilha_lucros = ctrl.Antecedent(np.arange(0, 1.1, 0.1), 'compartilha_lucros')
JA = ctrl.Antecedent(np.arange(0, 1.1, 0.1), 'JA')
TC = ctrl.Antecedent(np.arange(0, 21, 1), 'TC')
JQ = ctrl.Antecedent(np.arange(0, 21, 1), 'JQ')
indice_social = ctrl.Consequent(np.arange(0, 101, 1), 'indice_social')

Anos_de_estudo['muito_baixo'] = fuzz.trimf(Anos_de_estudo.universe, [0, 0, 5])
Anos_de_estudo['baixo'] = fuzz.trimf(Anos_de_estudo.universe, [3, 5, 8])
Anos_de_estudo['medio'] = fuzz.trimf(Anos_de_estudo.universe, [6, 9, 13])
Anos_de_estudo['alto'] = fuzz.trimf(Anos_de_estudo.universe, [10, 13, 16])
Anos_de_estudo['Muito alto'] = fuzz.trapmf(Anos_de_estudo.universe, [13, 16, 20, 20])

plano_saude['nao']= fuzz.trimf(plano_saude.universe, [0, 0, 0.5])
plano_saude['sim']= fuzz.trimf(plano_saude.universe, [0.5, 1, 1])

compartilha_lucros['nao']= fuzz.trimf(compartilha_lucros.universe, [0, 0, 0.5])
compartilha_lucros['sim']= fuzz.trimf(compartilha_lucros.universe, [0.5, 1, 1])

JA['muito_baixo']= fuzz.trimf(JA.universe, [0, 0, 0.2])
JA['baixo']= fuzz.trimf(JA.universe, [0.1, 0.25, 0.4])
JA['medio']= fuzz.trimf(JA.universe, [0.3, 0.45, 0.6])
JA['alto']= fuzz.trimf(JA.universe, [0.5, 0.65, 0.8])
JA['Muito alto']= fuzz.trapmf(JA.universe, [0.7, 0.85, 1, 1])


TC['muito_baixo']= fuzz.trimf(TC.universe, [0, 0, 4])
TC['baixo']= fuzz.trimf(TC.universe, [2, 5, 8])
TC['medio']= fuzz.trimf(TC.universe, [8, 10, 12])
TC['alto']= fuzz.trimf(TC.universe, [10, 12, 14])
TC['Muito alto']= fuzz.trapmf(TC.universe, [12, 16, 20, 20])

JQ['muito_baixo']= fuzz.trimf(JQ.universe, [0, 0, 4])
JQ['baixo']= fuzz.trimf(JQ.universe, [2, 5, 8])
JQ['medio']= fuzz.trimf(JQ.universe, [8, 10, 12])
JQ['alto']= fuzz.trimf(JQ.universe, [10, 12, 14])
JQ['Muito alto']= fuzz.trapmf(JQ.universe, [12, 16, 20, 20])

indice_social['muito_baixo'] = fuzz.trimf(indice_social.universe, [0, 0, 25])
indice_social['baixo'] = fuzz.trimf(indice_social.universe, [0, 25, 50])
indice_social['medio'] = fuzz.trimf(indice_social.universe, [25, 50, 75])
indice_social['alto'] = fuzz.trapmf(indice_social.universe, [50, 75, 100, 100])

#Regras
regras_social = []
regras_social.append(ctrl.Rule(JA['Muito alto'], indice_social['muito_baixo']))
regras_social.append(ctrl.Rule(JA['alto'], indice_social['baixo']))
regras_social.append(ctrl.Rule(JA['medio'], indice_social['medio']))
regras_social.append(ctrl.Rule(JA['baixo'], indice_social['alto']))
regras_social.append(ctrl.Rule(JA['muito_baixo'], indice_social['alto']))
regras_social.append(ctrl.Rule(Anos_de_estudo['alto'], indice_social['alto']))
regras_social.append(ctrl.Rule(Anos_de_estudo['medio'], indice_social['medio']))
regras_social.append(ctrl.Rule(Anos_de_estudo['baixo'], indice_social['baixo']))
regras_social.append(ctrl.Rule(Anos_de_estudo['muito_baixo'], indice_social['muito_baixo']))
regras_social.append(ctrl.Rule(Anos_de_estudo['Muito alto'], indice_social['alto']))
regras_social.append(ctrl.Rule(compartilha_lucros['sim'], indice_social['alto']))
regras_social.append(ctrl.Rule(compartilha_lucros['nao'], indice_social['baixo']))
regras_social.append(ctrl.Rule(JQ['alto']|JQ['Muito alto'], indice_social['alto']))
regras_social.append(ctrl.Rule(JQ['medio'], indice_social['medio']))
regras_social.append(ctrl.Rule(JQ['baixo']|JQ['muito_baixo'], indice_social['baixo']))
regras_social.append(ctrl.Rule(TC['medio'], indice_social['medio']))
regras_social.append(ctrl.Rule(TC['alto']|TC['Muito alto'], indice_social['alto']))
regras_social.append(ctrl.Rule(TC['baixo']|TC['muito_baixo'], indice_social['baixo']))
regras_social.append(ctrl.Rule(plano_saude['sim'], indice_social['alto']))
regras_social.append(ctrl.Rule(plano_saude['nao'], indice_social['baixo']))

sistema_social = ctrl.ControlSystem(regras_social)
simulador_social = ctrl.ControlSystemSimulation(sistema_social)

def calcular_indice_social(anos_estudo_val, plano_saude_val, compartilha_lucros_val, JA_val, TC_val, JQ_val):
    """
    Calcula o índice social a partir das 6 variáveis
    """
    try:
        # Atribuir valores
        simulador_social.input['Anos_de_estudo'] = anos_estudo_val
        simulador_social.input['plano_saude'] = plano_saude_val
        simulador_social.input['compartilha_lucros'] = compartilha_lucros_val
        simulador_social.input['JA'] = JA_val
        simulador_social.input['TC'] = TC_val
        simulador_social.input['JQ'] = JQ_val
        
        # Computar
        simulador_social.compute()
        
        return (simulador_social.output['indice_social']-20.83066751972702)*100/(80.55555555555556-20.83066751972702) 
    
    except Exception as e:
        print(f"Erro no cálculo do índice social: {e}")
        return None  # Valor padrão em caso de erro
    
#Econômicos
#FV=(Valor monetário atual da Fazenda/Total de area produtiva(ha))**(1/Tempo adotando o sistema produtivo atual)
#P=Lucro=Receita Total Bruta-Custo Total da produção/Area Produtiva Total
#DL=%da receita usada para despesas/Total de area produtiva(ha))**(1/Tempo adotando o sistema produtivo atual)
#WI=Salário do gerente,proprietário/Salário médio==3.225(média de salários no Brasil)
FV = ctrl.Antecedent(np.arange(0, 120, 1), 'FV')
WI = ctrl.Antecedent(np.arange(0, 11, 0.5), 'WI')
P = ctrl.Antecedent(np.arange(0, 7000, 100), 'P')
DL = ctrl.Antecedent(np.arange(0, 1.1, 0.1), 'DL')
indice_economico = ctrl.Consequent(np.arange(0, 101, 1), 'indice_economico')

# Regras
FV['muito_baixo'] = fuzz.trimf(FV.universe, [0, 1, 2])
FV['baixo'] = fuzz.trimf(FV.universe, [1, 3, 10])
FV['medio'] = fuzz.trimf(FV.universe, [8, 20, 40])
FV['alto'] = fuzz.trimf(FV.universe, [30, 60, 90])
FV['muito_alto'] = fuzz.trapmf(FV.universe, [80, 100, 120, 120])
        
WI['muito_baixo'] = fuzz.trimf(WI.universe, [0, 1, 2])
WI['baixo'] = fuzz.trimf(WI.universe, [1, 2, 4])
WI['medio'] = fuzz.trimf(WI.universe, [3, 4, 6])
WI['alto'] = fuzz.trimf(WI.universe, [5, 7, 9])
WI['muito_alto'] = fuzz.trapmf(WI.universe, [8, 9, 11, 11])
        
P['muito_baixo'] = fuzz.trimf(P.universe, [0, 100, 1000])
P['baixo'] = fuzz.trimf(P.universe, [500, 1500, 2500])
P['medio'] = fuzz.trimf(P.universe, [2000, 3500, 5000])
P['alto'] = fuzz.trimf(P.universe, [4500, 5500, 6500])
P['muito_alto'] = fuzz.trapmf(P.universe, [6000, 6700, 7000, 7000])
        
DL['muito_baixo'] = fuzz.trimf(DL.universe, [0, 0, 0.1])
DL['baixo'] = fuzz.trimf(DL.universe, [0.05, 0.15, 0.3])
DL['medio'] = fuzz.trimf(DL.universe, [0.2, 0.35, 0.5])
DL['alto'] = fuzz.trimf(DL.universe, [0.4, 0.6, 0.8])
DL['muito_alto'] = fuzz.trapmf(DL.universe, [0.7, 0.85, 1, 1])
        
# Índice econômico (saída)
indice_economico['muito_baixo'] = fuzz.trimf(indice_economico.universe, [0, 0, 25])
indice_economico['baixo'] = fuzz.trimf(indice_economico.universe, [0, 25, 50])
indice_economico['medio'] = fuzz.trimf(indice_economico.universe, [25, 50, 75])
indice_economico['alto'] = fuzz.trapmf(indice_economico.universe, [50, 75, 100, 100])

regras_economicas=[]
regras_economicas.append(ctrl.Rule(DL['muito_alto'], indice_economico['muito_baixo']))
regras_economicas.append(ctrl.Rule(DL['alto'], indice_economico['baixo']))
regras_economicas.append(ctrl.Rule(DL['medio'], indice_economico['medio']))
regras_economicas.append(ctrl.Rule(DL['baixo'], indice_economico['alto']))
regras_economicas.append(ctrl.Rule(DL['muito_baixo'], indice_economico['alto']))
regras_economicas.append(ctrl.Rule(WI['muito_alto'], indice_economico['alto']))
regras_economicas.append(ctrl.Rule(WI['alto'], indice_economico['alto']))
regras_economicas.append(ctrl.Rule(WI['medio'], indice_economico['medio']))
regras_economicas.append(ctrl.Rule(WI['baixo'], indice_economico['baixo']))
regras_economicas.append(ctrl.Rule(WI['muito_baixo'], indice_economico['muito_baixo']))
regras_economicas.append(ctrl.Rule(P['muito_alto'], indice_economico['alto']))
regras_economicas.append(ctrl.Rule(P['alto'], indice_economico['alto']))
regras_economicas.append(ctrl.Rule(P['medio'], indice_economico['medio']))
regras_economicas.append(ctrl.Rule(P['baixo'], indice_economico['baixo']))
regras_economicas.append(ctrl.Rule(P['muito_baixo'], indice_economico['muito_baixo']))
regras_economicas.append(ctrl.Rule(FV['muito_alto'], indice_economico['alto']))
regras_economicas.append(ctrl.Rule(FV['alto'], indice_economico['alto']))
regras_economicas.append(ctrl.Rule(FV['medio'], indice_economico['medio']))
regras_economicas.append(ctrl.Rule(FV['baixo'], indice_economico['baixo']))
regras_economicas.append(ctrl.Rule(FV['muito_baixo'], indice_economico['muito_baixo']))

sistema_economico = ctrl.ControlSystem(regras_economicas)
simulador_economico = ctrl.ControlSystemSimulation(sistema_economico)

def calcular_indice_economico(DL_val,FV_val,P_val,WI_val):
    """
    Calcula o índice economico a partir das 6 variáveis
    """
    try:
        # Atribuir valores
        simulador_economico.input['DL'] = DL_val
        simulador_economico.input['FV'] = FV_val
        simulador_economico.input['P'] = P_val
        simulador_economico.input['WI'] = WI_val
        
        # Computar
        simulador_economico.compute()
        
        return (simulador_economico.output['indice_economico']-8.333333333333332)*100/(80.55555555555556-8.333333333333332)
   
    except Exception as e:
        print(f"Erro no cálculo do índice economico: {e}")
        return None  # Valor padrão em caso de erro
    
#Ambiental
#FO=%Area conservada/Regulamentação \\\\ %Area conservada=(Area total-Area produtiva)/Area total \\\\Regulamentação: 80% para a amazonia, 35% pro cerrado, 20% pro resto
Regulamentação={"AM":0.8,"AC":0.8,"RO":0.8,"RR":0.8,"AP":0.8,"PA":0.8,"DF":0.35,"GO":0.35,"MT":0.35,"TO":0.35,"MG":0.35,"MA":0.35,"MS":0.35,"RS":0.2,"RJ":0.2,"SP":0.2,"SC":0.2,
                "PR":0.2,"ES":0.2,"BA":0.2,"SE":0.2,"AL":0.2,"PE":0.2,"PB":0.2,"RN":0.2,"CE":0.2,"PI":0.2}
Chuva={"AM":2609,"AC":2158,"RO":1950,"RR":1754,"AP":2525,"PA":2252,"DF":1478,"GO":1511,"MT":1588,"TO":1619,"MG":1226,"MA":1586,"MS":1219,"RS":1635,"RJ":1403,"SP":1450,"SC":1921,
                "PR":1802,"ES":1309,"BA":926,"SE":1068,"AL":1325,"PE":930,"PB":1837,"RN":1214,"CE":1123,"PI":1039}
Evapo={"AM":2221,"AC":1958,"RO":1750,"RR":1800,"AP":2182,"PA":2199,"DF":1304,"GO":1689,"MT":2066,"TO":2138,"MG":1512,"MA":2181,"MS":2000,"RS":1427,"RJ":1722,"SP":1427,"SC":1242,
                "PR":1378,"ES":1756,"BA":1722,"SE":1804,"AL":1711,"PE":1932,"PB":2022,"RN":2062,"CE":1878,"PI":2668}
#Escoamento=(Pluviosidade-Evapotranpiração)/Pluviosidade
#consumo_area=Consumo de comsustivel(anual)/area total(ha) 
FO = ctrl.Antecedent(np.arange(0, 1.1, 0.1), 'FO')
Escoamento = ctrl.Antecedent(np.arange(-1, 1.1, 0.1), 'Escoamento')
consumo_area = ctrl.Antecedent(np.arange(0, 40, 1), 'consumo_area')
indice_ambiental = ctrl.Consequent(np.arange(0, 101, 1), 'indice_ambiental')

# Regras
Escoamento['muito_alto'] = fuzz.trimf(Escoamento.universe, [-1, -1, -0.2])
Escoamento['alto'] = fuzz.trimf(Escoamento.universe, [-0.3, -0.1, 0.1])
Escoamento['medio'] = fuzz.trimf(Escoamento.universe, [0, 0.2, 0.4])
Escoamento['baixo'] = fuzz.trimf(Escoamento.universe, [0.3, 0.5, 0.7])
Escoamento['muito_baixo'] = fuzz.trapmf(Escoamento.universe, [0.6, 0.8, 1, 1])

consumo_area['muito_baixo'] = fuzz.trimf(consumo_area.universe, [0, 0, 3])       # < 3 L/ha (ótimo)
consumo_area['baixo'] = fuzz.trimf(consumo_area.universe, [1, 4, 8])             # 2-8 L/ha (bom)
consumo_area['medio'] = fuzz.trimf(consumo_area.universe, [6, 10, 15])           # 6-15 L/ha (médio)
consumo_area['alto'] = fuzz.trimf(consumo_area.universe, [12, 18, 25])           # 12-25 L/ha (alto)
consumo_area['muito_alto'] = fuzz.trapmf(consumo_area.universe, [20, 28, 40, 40]) # > 20 L/ha (crítico)
        
FO['muito_baixo'] = fuzz.trimf(FO.universe, [0, 0, 0.1])
FO['baixo'] = fuzz.trimf(FO.universe, [0.05, 0.15, 0.3])
FO['medio'] = fuzz.trimf(FO.universe, [0.2, 0.35, 0.5])
FO['alto'] = fuzz.trimf(FO.universe, [0.4, 0.6, 0.8])
FO['muito_alto'] = fuzz.trapmf(FO.universe, [0.7, 0.85, 1, 1])
        
# Índice econômico (saída)
indice_ambiental['muito_baixo'] = fuzz.trimf(indice_ambiental.universe, [0, 0, 25])
indice_ambiental['baixo'] = fuzz.trimf(indice_ambiental.universe, [0, 25, 50])
indice_ambiental['medio'] = fuzz.trimf(indice_ambiental.universe, [25, 50, 75])
indice_ambiental['alto'] = fuzz.trapmf(indice_ambiental.universe, [50, 75, 100, 100])


regras_ambientais=[]
regras_ambientais.append(ctrl.Rule(Escoamento['medio'], indice_ambiental['alto']))
regras_ambientais.append(ctrl.Rule(Escoamento['baixo'] | Escoamento['alto'], indice_ambiental['medio']))
regras_ambientais.append(ctrl.Rule(Escoamento['muito_baixo'] | Escoamento['muito_alto'], indice_ambiental['baixo']))
regras_ambientais.append(ctrl.Rule(FO['baixo'], indice_economico['baixo']))
regras_ambientais.append(ctrl.Rule(FO['muito_baixo'], indice_economico['muito_baixo']))
regras_ambientais.append(ctrl.Rule(FO['alto'], indice_economico['alto']))
regras_ambientais.append(ctrl.Rule(FO['muito_alto'], indice_economico['alto']))
regras_ambientais.append(ctrl.Rule(FO['medio'], indice_economico['medio']))
regras_ambientais.append(ctrl.Rule(consumo_area['muito_baixo'], indice_ambiental['alto']))
regras_ambientais.append(ctrl.Rule(consumo_area['baixo'], indice_ambiental['alto']))
regras_ambientais.append(ctrl.Rule(consumo_area['medio'], indice_ambiental['medio']))
regras_ambientais.append(ctrl.Rule(consumo_area['alto'], indice_ambiental['baixo']))
regras_ambientais.append(ctrl.Rule(consumo_area['muito_alto'], indice_ambiental['muito_baixo']))



sistema_ambiental = ctrl.ControlSystem(regras_ambientais)
simulador_ambiental = ctrl.ControlSystemSimulation(sistema_ambiental)

def calcular_indice_ambiental(Escoamento_val,FO_val,consumo_area_val):
    """
    Calcula o índice ambiental a partir das 6 variáveis
    """
    try:
        # Atribuir valores
        simulador_ambiental.input['FO'] = FO_val
        simulador_ambiental.input['consumo_area'] = consumo_area_val
        simulador_ambiental.input['Escoamento'] = Escoamento_val
        
        # Computar
        simulador_ambiental.compute()
        
        return (simulador_ambiental.output['indice_ambiental']-20.83066751972702)*100/(80.55555555555556-20.83066751972702)
    
    except Exception as e:
        print(f"Erro no cálculo do índice ambiental: {e}")
        return None  # Valor padrão em caso de erro

# Variáveis de entrada Sustentabilidade
economico = ctrl.Antecedent(np.arange(0, 101, 1), 'economico')
social = ctrl.Antecedent(np.arange(0, 101, 1), 'social')  
ambiental = ctrl.Antecedent(np.arange(0, 101, 1), 'ambiental')
# Variável de saída
sustentabilidade = ctrl.Consequent(np.arange(0, 101, 1), 'sustentabilidade')

# CONJUNTOS FUZZY
economico['muito_baixo'] = fuzz.trimf(economico.universe, [0, 0, 25])
economico['baixo'] = fuzz.trimf(economico.universe, [0, 25, 50])
economico['medio'] = fuzz.trimf(economico.universe, [25, 50, 75])
economico['alto'] = fuzz.trapmf(economico.universe, [50, 75, 100, 100])

social['muito_baixo'] = fuzz.trimf(social.universe, [0, 0, 25])
social['baixo'] = fuzz.trimf(social.universe, [0, 25, 50])
social['medio'] = fuzz.trimf(social.universe, [25, 50, 75])
social['alto'] = fuzz.trapmf(social.universe, [50, 75, 100, 100])

ambiental['muito_baixo'] = fuzz.trimf(ambiental.universe, [0, 0, 25])
ambiental['baixo'] = fuzz.trimf(ambiental.universe, [0, 25, 50])
ambiental['medio'] = fuzz.trimf(ambiental.universe, [25, 50, 75])
ambiental['alto'] = fuzz.trapmf(ambiental.universe, [50, 75, 100, 100])

sustentabilidade['muito_baixo'] = fuzz.trimf(sustentabilidade.universe, [0, 0, 25])
sustentabilidade['baixo'] = fuzz.trimf(sustentabilidade.universe, [0, 25, 50])
sustentabilidade['medio'] = fuzz.trimf(sustentabilidade.universe, [25, 50, 75])
sustentabilidade['alto'] = fuzz.trapmf(sustentabilidade.universe, [50, 75, 100, 100])

# REGRAS FUZZY
# Regra 1: Se qualquer input é muito baixo, o output é muito baixo
regra1 = ctrl.Rule(economico['muito_baixo'] | social['muito_baixo'] | ambiental['muito_baixo'], 
                   sustentabilidade['muito_baixo'])

# Regra 2: Se qualquer input é baixo, o output é baixo
regra2 = ctrl.Rule(economico['baixo'] | social['baixo'] | ambiental['baixo'], 
                   sustentabilidade['baixo'])

# Regra 3: Se há pelo menos dois inputs Médios, o output é médio
regra3 = ctrl.Rule((economico['medio'] & social['medio']) | 
                   (economico['medio'] & ambiental['medio']) | 
                   (social['medio'] & ambiental['medio']), 
                   sustentabilidade['medio'])

# Regra 4: Se há pelo menos dois inputs Altos, o output é alto
regra4 = ctrl.Rule((economico['alto'] & social['alto']) | 
                   (economico['alto'] & ambiental['alto']) | 
                   (social['alto'] & ambiental['alto']), 
                   sustentabilidade['alto'])

# SISTEMA DE CONTROLE
sistema_controle = ctrl.ControlSystem([regra1, regra2, regra3, regra4])
sistema = ctrl.ControlSystemSimulation(sistema_controle)

# FUNÇÃO  SUSTENTABILIDADE
def calcular_sustentabilidade(economico_val, social_val, ambiental_val):
    """
    Recebe 3 inputs (0-100) e retorna a sustentabilidade (0-100)
    usando lógica fuzzy com método de Mamdani e defuzzificação por centroide   
    Argumentos: economico_val: Valor econômico (0-100), social_val: Valor social (0-100), ambiental_val: Valor ambiental (0-100)    
    Retorna:
        float: Valor de sustentabilidade entre 0-100
    """
    try:
        # Validar inputs
        for nome, valor in [('Econômico', economico_val), ('Social', social_val), ('Ambiental', ambiental_val)]:
            if valor < 0 or valor > 100:
                raise ValueError(f"Valor {nome} deve estar entre 0-100")
        
        # Atribuir os valores de entrada
        sistema.input['economico'] = economico_val
        sistema.input['social'] = social_val
        sistema.input['ambiental'] = ambiental_val
        
        # Computar o resultado
        sistema.compute()
        
        # Retornar o valor defuzzificado
        return (sistema.output['sustentabilidade']-8.33)*100/(80.56-8.33)
    
    except Exception as e:
        print(f"Erro no cálculo: {e}")
        return None

# FUNÇÃO PARA VISUALIZAR O CÁLCULO
def visualizar_calculo(economico_val, social_val, ambiental_val):
    resultado = (calcular_sustentabilidade(economico_val, social_val, ambiental_val)-8.33)*100/(80.56-8.33)
    if resultado is not None:
        print(f"\n=== CÁLCULO DE SUSTENTABILIDADE ===")
        print(f"Econômico: {economico_val}")
        print(f"Social: {social_val}")
        print(f"Ambiental: {ambiental_val}")
        print(f"Sustentabilidade: {resultado:.2f}")
        print("=" * 40)
        
        # Visualizar a saída
        sustentabilidade.view(sim=sistema)
        plt.title(f'Sustentabilidade: {resultado:.2f}')
        plt.show()
        
    return resultado
print(calcular_indice_ambiental(-1,0,40))

