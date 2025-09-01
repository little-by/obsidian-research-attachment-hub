/**
 * 期刊等级识别器
 * 自动识别CCF等级和SCI分区
 */
export class JournalLevelDetector {
	// CCF会议和期刊数据库
	private static readonly CCF_A_CONFERENCES = [
		'SIGCOMM', 'SIGGRAPH', 'SIGKDD', 'SIGMOD', 'SIGOPS', 'SIGPLAN', 'SIGSAC', 'SIGCHI',
		'ICSE', 'FSE', 'ASE', 'ICSE', 'ISSTA', 'ICST', 'ICPC', 'MSR',
		'ICML', 'ICLR', 'NeurIPS', 'AAAI', 'IJCAI', 'ICCV', 'CVPR', 'ECCV',
		'STOC', 'FOCS', 'SODA', 'ICALP', 'LICS', 'POPL', 'PLDI', 'OOPSLA'
	];

	private static readonly CCF_B_CONFERENCES = [
		'INFOCOM', 'ICNP', 'ICDCS', 'IPDPS', 'HPDC', 'ICDCS', 'SRDS', 'DSN',
		'ESEC', 'FASE', 'TACAS', 'CAV', 'FM', 'CONCUR', 'ICALP', 'LICS',
		'UAI', 'COLT', 'AISTATS', 'ICDM', 'KDD', 'WSDM', 'CIKM', 'SIGIR',
		'FOCS', 'STOC', 'SODA', 'ICALP', 'LICS', 'POPL', 'PLDI', 'OOPSLA'
	];

	private static readonly CCF_C_CONFERENCES = [
		'ICC', 'GLOBECOM', 'WCNC', 'VTC', 'PIMRC', 'WCNC', 'VTC', 'PIMRC',
		'ICSE', 'FSE', 'ASE', 'ICSE', 'ISSTA', 'ICST', 'ICPC', 'MSR',
		'ICML', 'ICLR', 'NeurIPS', 'AAAI', 'IJCAI', 'ICCV', 'CVPR', 'ECCV'
	];

	// SCI期刊数据库（简化版，实际应用中需要更完整的数据库）
	private static readonly SCI_1_JOURNALS = [
		'Nature', 'Science', 'Cell', 'Nature Methods', 'Nature Biotechnology',
		'Nature Nanotechnology', 'Nature Materials', 'Nature Physics',
		'Science Advances', 'Nature Communications', 'PNAS'
	];

	private static readonly SCI_2_JOURNALS = [
		'IEEE Transactions on Pattern Analysis and Machine Intelligence',
		'IEEE Transactions on Information Theory', 'IEEE Transactions on Computers',
		'ACM Transactions on Computer Systems', 'ACM Transactions on Database Systems',
		'Journal of the ACM', 'SIAM Journal on Computing'
	];

	private static readonly SCI_3_JOURNALS = [
		'IEEE Transactions on Software Engineering', 'IEEE Transactions on Knowledge and Data Engineering',
		'ACM Transactions on Software Engineering and Methodology',
		'Information and Computation', 'Theoretical Computer Science'
	];

	private static readonly SCI_4_JOURNALS = [
		'Journal of Computer Science and Technology', 'Computer Science Review',
		'Journal of Systems and Software', 'Software: Practice and Experience'
	];

	/**
	 * 自动识别期刊等级
	 */
	static detectJournalLevel(publisher: string, title: string = ''): 'CCF-A' | 'CCF-B' | 'CCF-C' | 'SCI-1' | 'SCI-2' | 'SCI-3' | 'SCI-4' | 'Other' {
		if (!publisher) return 'Other';

		const publisherUpper = publisher.toUpperCase();
		const titleUpper = title.toUpperCase();

		// 检查是否为会议
		if (this.isConference(publisherUpper, titleUpper)) {
			return this.detectCCFLevel(publisherUpper, titleUpper);
		}

		// 检查是否为期刊
		if (this.isJournal(publisherUpper, titleUpper)) {
			return this.detectSCILevel(publisherUpper, titleUpper);
		}

		return 'Other';
	}

	/**
	 * 判断是否为会议
	 */
	private static isConference(publisher: string, title: string): boolean {
		const conferenceKeywords = ['CONFERENCE', 'CONF', 'SYMPOSIUM', 'SYMP', 'WORKSHOP', 'WORKSHOP', 'IC', 'AAAI', 'ICML', 'ICLR', 'CVPR', 'ICCV', 'ECCV'];
		
		return conferenceKeywords.some(keyword => 
			publisher.includes(keyword) || title.includes(keyword)
		);
	}

	/**
	 * 判断是否为期刊
	 */
	private static isJournal(publisher: string, title: string): boolean {
		const journalKeywords = ['JOURNAL', 'J.', 'TRANSACTIONS', 'TRANS.', 'LETTERS', 'LETT.', 'REVIEW', 'REV.'];
		
		return journalKeywords.some(keyword => 
			publisher.includes(keyword) || title.includes(keyword)
		);
	}

	/**
	 * 检测CCF等级
	 */
	private static detectCCFLevel(publisher: string, title: string): 'CCF-A' | 'CCF-B' | 'CCF-C' | 'Other' {
		// 检查CCF-A
		if (this.CCF_A_CONFERENCES.some(conf => 
			publisher.includes(conf.toUpperCase()) || title.includes(conf.toUpperCase())
		)) {
			return 'CCF-A';
		}

		// 检查CCF-B
		if (this.CCF_B_CONFERENCES.some(conf => 
			publisher.includes(conf.toUpperCase()) || title.includes(conf.toUpperCase())
		)) {
			return 'CCF-B';
		}

		// 检查CCF-C
		if (this.CCF_C_CONFERENCES.some(conf => 
			publisher.includes(conf.toUpperCase()) || title.includes(conf.toUpperCase())
		)) {
			return 'CCF-C';
		}

		return 'Other';
	}

	/**
	 * 检测SCI等级
	 */
	private static detectSCILevel(publisher: string, title: string): 'SCI-1' | 'SCI-2' | 'SCI-3' | 'SCI-4' | 'Other' {
		// 检查SCI-1
		if (this.SCI_1_JOURNALS.some(journal => 
			publisher.includes(journal.toUpperCase()) || title.includes(journal.toUpperCase())
		)) {
			return 'SCI-1';
		}

		// 检查SCI-2
		if (this.SCI_2_JOURNALS.some(journal => 
			publisher.includes(journal.toUpperCase()) || title.includes(journal.toUpperCase())
		)) {
			return 'SCI-2';
		}

		// 检查SCI-3
		if (this.SCI_3_JOURNALS.some(journal => 
			publisher.includes(journal.toUpperCase()) || title.includes(journal.toUpperCase())
		)) {
			return 'SCI-3';
		}

		// 检查SCI-4
		if (this.SCI_4_JOURNALS.some(journal => 
			publisher.includes(journal.toUpperCase()) || title.includes(journal.toUpperCase())
		)) {
			return 'SCI-4';
		}

		return 'Other';
	}

	/**
	 * 获取期刊等级描述
	 */
	static getJournalLevelDescription(level: string): string {
		const descriptions: { [key: string]: string } = {
			'CCF-A': 'CCF A类会议/期刊（顶级）',
			'CCF-B': 'CCF B类会议/期刊（重要）',
			'CCF-C': 'CCF C类会议/期刊（一般）',
			'SCI-1': 'SCI一区期刊（顶级）',
			'SCI-2': 'SCI二区期刊（重要）',
			'SCI-3': 'SCI三区期刊（一般）',
			'SCI-4': 'SCI四区期刊（较低）',
			'Other': '其他'
		};
		return descriptions[level] || '未知';
	}

	/**
	 * 获取所有期刊等级选项
	 */
	static getAllJournalLevels(): Array<{value: string, label: string, description: string}> {
		return [
			{ value: 'CCF-A', label: 'CCF A类', description: 'CCF A类会议/期刊（顶级）' },
			{ value: 'CCF-B', label: 'CCF B类', description: 'CCF B类会议/期刊（重要）' },
			{ value: 'CCF-C', label: 'CCF C类', description: 'CCF C类会议/期刊（一般）' },
			{ value: 'SCI-1', label: 'SCI一区', description: 'SCI一区期刊（顶级）' },
			{ value: 'SCI-2', label: 'SCI二区', description: 'SCI二区期刊（重要）' },
			{ value: 'SCI-3', label: 'SCI三区', description: 'SCI三区期刊（一般）' },
			{ value: 'SCI-4', label: 'SCI四区', description: 'SCI四区期刊（较低）' },
			{ value: 'Other', label: '其他', description: '其他类型' }
		];
	}
}
