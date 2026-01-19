# FREEWILL

Acesse (Entre em contato comigo para ativar o servidor): https://jonasguinami.github.io/FreeWill/

🧠 FreeWill AI: Autonomous Local LLM & RAG Engine
Uma infraestrutura de pesquisa em IA focada na independência total. Implementa fine-tuning de modelos proprietários e expansão de conhecimento via RAG, operando sem dependências de APIs de terceiros ou camadas de abstração simplistas.

O FreeWill AI explora a fronteira da soberania computacional, utilizando um Small Language Model (SLM) de 35 milhões de parâmetros desenvolvido do zero, além de integração direta com modelos do ecossistema Hugging Face.

✨ Features
Custom SLM Core: Modelo proprietário de 35M de parâmetros otimizado para execução local de alta performance.

Bare-Metal HF Integration: Conexão direta com a biblioteca Transformers, sem intermediários (como Ollama).

RAG Pipeline: Sistema de busca semântica para injeção de contexto em tempo real.

Dataset Curatorship: Processamento e limpeza de bases de dados massivas para contextos específicos.

Zero-Cloud Policy: Todo o processamento, desde a tokenização até a inferência, acontece estritamente no seu hardware.

🏗️ Architecture
O ecossistema é dividido em camadas modulares para garantir que a inteligência seja expansível e privada.

Camada 0 – Data & Tokens Gerencia a curadoria de datasets e o vocabulário customizado para o modelo de 35M, garantindo que o "conhecimento base" seja denso e relevante.

Camada 1 – Model Engine Onde residem os pesos e a lógica de inferência. Suporta o carregamento de tensores do Hugging Face e a arquitetura nativa do FreeWill-35M.

Camada 2 – Fine-Tuning Pipeline Scripts de otimização de parâmetros para especializar o modelo em domínios específicos através de aprendizado supervisionado local.

Camada 3 – RAG (Knowledge Expansion) O módulo de memória externa. Transforma documentos em vetores e os recupera para expandir o horizonte de resposta do modelo sem retreino.

Camada 4 – Interface de Autonomia Interface de comando para interação direta com a IA, focada em depuração técnica e análise de outputs.

🛠️ Installation & Setup
Prerequisites
Python 3.10+

PyTorch (compatível com seu hardware local)

Hugging Face transformers & datasets

Steps
Clone o repositório

Bash

git clone https://github.com/jonasguinami/FreeWillAI.git
cd FreeWillAI
Instale as dependências core

Bash

pip install torch transformers datasets faiss-cpu
Inicie o modelo proprietário

Bash

python main.py --model ./weights/freewill-35m
🔬 O Modelo de 35M
Diferente de modelos gigantes, o FreeWill-35M foca na eficiência de parâmetros. Ele foi projetado para:

Atuar como um classificador e gerador de lógica de baixo nível.

Rodar com consumo mínimo de VRAM.

Servir de base para experimentos de "Proof-of-Utility".

🔮 Roadmap
[ ] Otimização de quantização para o modelo proprietário.

[ ] Integração de memória persistente via Vector DB.

[ ] Interface gráfica minimalista (Inspirada na estética Apple/Nike).

[ ] Expansão do dataset para 100M+ parâmetros.

👨‍💻 Author
Jonas Guinami

Computer Scientist & AI Researcher

GitHub: @jonasguinami
