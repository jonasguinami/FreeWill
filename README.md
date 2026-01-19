# FREEWILL

Acesse (Entre em contato comigo para ativar o servidor): https://jonasguinami.github.io/FreeWill/

🧠 FreeWill AI
Local LLM Fine-tuning & RAG Engine

O FreeWill AI é um ecossistema de pesquisa focado na autonomia total de modelos de linguagem. O projeto se diferencia por não depender de abstrações de terceiros, operando diretamente com modelos da biblioteca Hugging Face e um Small Language Model (SLM) proprietário, desenvolvido e treinado com foco em eficiência extrema e execução local.

🚀 Diferenciais Técnicos
Custom SLM (35M): Desenvolvimento e fine-tuning de um modelo próprio de 35 milhões de parâmetros, otimizado para contextos específicos onde latência e privacidade são críticas.

Direct HF Integration: Pipeline construído para carregar, manipular e testar modelos do Hugging Face sem camadas intermediárias desnecessárias.

RAG Nativo: Expansão de conhecimento via Retrieval-Augmented Generation, permitindo que o modelo consulte bases de dados locais em tempo real.

Hardware Agnostic: Projetado para rodar em hardware doméstico, extraindo o máximo de performance de CPUs e GPUs locais através de otimização de tensores.

🛠️ Stack Tecnológica
Linguagem: Python

Deep Learning: PyTorch / Transformers (Hugging Face)

Processamento de Dados: Tokenizadores customizados para o modelo de 35M.

Vetores/RAG: Bibliotecas de busca semântica para indexação de documentos.

🔬 Pesquisa de Fine-tuning
O foco deste repositório é o desenvolvimento de pipelines de treinamento que permitem:

Injeção de conhecimento especializado em modelos pré-treinados.

Refinamento do modelo proprietário (FreeWill-35M) para tarefas de lógica e processamento de linguagem natural.

Curadoria de datasets customizados para treinamento de baixo nível.

📜 Filosofia
O FreeWill AI nasce da premissa de que a inteligência artificial deve ser um utilitário local, privado e moldável pelo seu criador. Menos "caixa preta", mais controle sobre os pesos e a arquitetura.

Nota: Este projeto é uma implementação de "AI Bare-Metal", focada em quem busca entender o que acontece entre as camadas da rede neural, longe de instaladores automatizados.
