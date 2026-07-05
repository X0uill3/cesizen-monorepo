import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Eye, EyeOff, Loader2, ArrowLeft, Settings, HelpCircle } from 'lucide-react';
import api from '../../api/api';
import DiagnosticModal from '../../components/DiagnosticModal'; // Modale pour les questions
import TestModal from '../../components/TestModal';

const AdminDiagnostics = () => {
    // --- ÉTATS ---
    const [loading, setLoading] = useState(true);

    // Niveau 1 : Les Tests
    const [tests, setTests] = useState<any[]>([]);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [selectedTestForm, setSelectedTestForm] = useState<any>(null);

    // Niveau 2 : Les Questions (quand on rentre dans un test)
    const [activeTest, setActiveTest] = useState<any>(null); // Le test en cours de visionnage
    const [questions, setQuestions] = useState<any[]>([]);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

    // --- CHARGEMENT INITIAL ---
    useEffect(() => {
        fetchTests();
    }, []);

    // --- API : TESTS ---
    const fetchTests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/diagnostic/admin/tests');
            setTests(res.data.data.tests);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const toggleTestStatus = async (id: string) => {
        try {
            await api.patch(`/diagnostic/admin/tests/${id}/toggle`);
            fetchTests();
        } catch (err) { alert("Erreur lors de la modification du test"); }
    };

    // --- API : QUESTIONS ---
    const fetchQuestionsForTest = async (testId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/diagnostic/admin/tests/${testId}/questions`);
            setQuestions(res.data.data.questions);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    // --- NAVIGATION INTERNE ---
    const openTestQuestions = (test: any) => {
        setActiveTest(test);
        fetchQuestionsForTest(test._id);
    };

    const goBackToTests = () => {
        setActiveTest(null);
        setQuestions([]);
        fetchTests();
    };

    if (loading && !tests.length && !questions.length) {
        return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zen-sage" size={40} /></div>;
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        {activeTest && (
                            <button onClick={goBackToTests} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                <ArrowLeft size={20} className="text-gray-600" />
                            </button>
                        )}
                        <h1 className="text-3xl font-bold text-gray-800">
                            {activeTest ? `Questions : ${activeTest.title}` : 'Catalogue d\'Évaluations'}
                        </h1>
                    </div>
                    <p className="text-gray-500 mt-1">
                        {activeTest ? 'Gérez les questions spécifiques à ce test.' : 'Gérez les différents tests disponibles sur l\'application.'}
                    </p>
                </div>

                <button
                    onClick={() => {
                        if (activeTest) {
                            setSelectedQuestion(null);
                            setIsQuestionModalOpen(true);
                        } else {
                            setSelectedTestForm(null);
                            setIsTestModalOpen(true);
                        }
                    }}
                    className="bg-zen-sage text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-zen-sage/20 hover:opacity-90 transition-all"
                >
                    <Plus size={20} /> {activeTest ? 'Nouvelle Question' : 'Nouveau Test'}
                </button>
            </header>

            <div className="bg-white rounded-zen shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {!activeTest ? (
                                // En-têtes pour les TESTS
                                <>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Titre du test</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Règles (Scores)</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
                                </>
                            ) : (
                                // En-têtes pour les QUESTIONS
                                <>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest w-16 text-center">Ordre</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Question</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Réponses</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
                                </>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50">
                        {/* AFFICHAGE DES TESTS */}
                        {!activeTest && tests.map((test) => (
                            <tr key={test._id} className={`transition-colors ${test.isActive ? 'hover:bg-gray-50/50' : 'bg-gray-50/50 opacity-60'}`}>
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{test.title}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{test.description}</div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="text-xs font-bold text-zen-sky bg-zen-sky/10 px-3 py-1 rounded-full">
                                        {test.rules?.length || 0} règles
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openTestQuestions(test)}
                                            className="px-3 py-1.5 text-xs font-bold text-zen-sage bg-zen-sage/10 hover:bg-zen-sage/20 rounded-lg transition-all"
                                        >
                                            Gérer les questions
                                        </button>
                                        <button onClick={() => { setSelectedTestForm(test); setIsTestModalOpen(true); }} className="p-2 text-gray-400 hover:text-zen-sage hover:bg-gray-100 rounded-lg transition-all"><Edit2 size={18} /></button>
                                        <button onClick={() => toggleTestStatus(test._id)} className={`p-2 rounded-lg transition-all ${test.isActive ? 'text-green-400 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}>
                                            {test.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* AFFICHAGE DES QUESTIONS */}
                        {activeTest && questions.map((q) => (
                            <tr key={q._id} className={`transition-colors ${q.isActive ? 'hover:bg-gray-50/50' : 'bg-gray-50/50 opacity-60'}`}>
                                <td className="p-4 text-center">
                                    <span className="text-sm font-black text-gray-400 bg-white shadow-sm border border-gray-100 w-8 h-8 rounded-lg flex items-center justify-center mx-auto">{q.order}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-zen-sage/10 flex items-center justify-center text-zen-sage shrink-0"><HelpCircle size={18} /></div>
                                        <span className="font-bold text-gray-800 line-clamp-2">{q.text}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="text-xs font-bold text-zen-sky bg-zen-sky/10 px-3 py-1 rounded-full">{q.answers?.length || 0} choix</span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => { setSelectedQuestion(q); setIsQuestionModalOpen(true); }} className="p-2 text-gray-400 hover:text-zen-sage hover:bg-gray-100 rounded-lg transition-all"><Edit2 size={18} /></button>
                                        <button onClick={async () => {
                                            await api.patch(`/diagnostic/admin/questions/${q._id}/toggle`);
                                            fetchQuestionsForTest(activeTest._id);
                                        }} className={`p-2 rounded-lg transition-all ${q.isActive ? 'text-green-400 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}>
                                            {q.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* Messages si vide */}
                        {!activeTest && tests.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-gray-400">Aucun test configuré.</td></tr>}
                        {activeTest && questions.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">Aucune question dans ce test.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* MODALE POUR LES QUESTIONS */}
            {activeTest && (
                <DiagnosticModal
                    isOpen={isQuestionModalOpen}
                    onClose={() => setIsQuestionModalOpen(false)}
                    question={selectedQuestion}
                    testId={activeTest._id}
                    onSuccess={() => fetchQuestionsForTest(activeTest._id)}
                />
            )}

            <TestModal
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
                testData={selectedTestForm}
                onSuccess={fetchTests}
            />
        </div>
    );
};

export default AdminDiagnostics;