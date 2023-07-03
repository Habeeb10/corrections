import { START_LOAD_DOCS, LOAD_DOCS, LOAD_DOCS_FAILED } from '../types/document_types';

import { Network } from '_services';

export const getDocuments = () => {
    return dispatch => {
        dispatch({ type: START_LOAD_DOCS });
        Network.getDocumentTypes()
            .then((document_types_result) => {
                Network.getUserDocuments()
                    .then((user_documents_result) => {
                        let documents = document_types_result.data;
                        let user_documents = user_documents_result.data;

                        documents = documents.map(doc => ({
                            ...doc,
                            user_data: user_documents.find(user_doc => user_doc.type_id === doc.id)
                        }));

                        dispatch({
                            documents,
                            type: LOAD_DOCS
                        })
                    })
                    .catch((error) => {
                        dispatch({ type: LOAD_DOCS_FAILED, error_message: error.message });
                    });
            })
            .catch((error) => {
                dispatch({ type: LOAD_DOCS_FAILED, error_message: error.message });
            });
    };
};